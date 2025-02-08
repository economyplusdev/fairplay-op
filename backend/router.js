require('dotenv').config();
const cluster = require('cluster');
const db = require('./modules/database/rocksDB');
const mongo = require('./modules/database/mongoDB');
const { Client, GatewayIntentBits } = require('discord.js');
const fastify = require('fastify')({ logger: false });
const path = require('path');
const fs = require('fs');
const fastifyCors = require('@fastify/cors');
const client = require('prom-client');

const numCPUs = 1;
const pendingRequests = {};
let requestIdCounter = 0;

if (cluster.isMaster) {
  db.openDB()
    .then(async () => {
      await mongo.connectDB();
      for (let i = 0; i < numCPUs; i++) cluster.fork();
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited with code: ${code}, signal: ${signal}`);
        if (code !== 0) {
          console.log('Restarting worker...');
          cluster.fork();
        }
      });
      cluster.on('fork', (worker) => {
        console.log(`Worker ${worker.process.pid} started.`);
        worker.on('message', async (message) => {
          if (message.cmd === 'dbOperation') {
            const { requestId, operation, key, value, collectionName, query } = message;
            try {
              let result;
              if (operation === 'rocksdb.get') result = await db.get(key);
              else if (operation === 'rocksdb.put') await db.put(key, value);
              else if (operation === 'mongodb.findOne') result = await mongo.findOne(collectionName, query);
              else if (operation === 'mongodb.insertOne') result = await mongo.insertOne(collectionName, value);
              else if (operation === 'mongodb.updateOne') result = await mongo.updateOne(collectionName, query, value);
              else if (operation === 'mongodb.deleteOne') result = await mongo.deleteOne(collectionName, query);
              else throw new Error('Invalid operation');
              worker.send({ requestId, err: null, result });
            } catch (error) {
              console.error(`Error during DB operation: ${error.message}`);
              worker.send({ requestId, err: error.toString() });
            }
          }
        });
      });
    })
    .catch((error) => {
      console.error(`Failed to initialize master process: ${error.message}`);
      process.exit(1);
    });
} else {
  const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
  discordClient.on('ready', () => console.log('Discord client is ready.'));
  discordClient.on('error', (error) => console.error(`Discord client error: ${error.message}`));
  discordClient.login(process.env.discordToken).catch((error) => {
    console.error(`Failed to login to Discord: ${error.message}`);
  });

  process.on('uncaughtException', (error) => {
    console.error(`Uncaught Exception: ${error.message} ${error.stack}`);
  });

  process.on('unhandledRejection', (reason) => {
    if (reason && Array.isArray(reason.errors)) {
      reason.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });
    } else {
      console.log('Unhandled Rejection:', reason);
    }
  });

  process.on('message', (message) => {
    const { requestId, err, result } = message;
    if (pendingRequests[requestId]) {
      if (err) {
        console.error(`DB operation error: ${err}`);
        pendingRequests[requestId].reject(new Error(err));
      } else {
        pendingRequests[requestId].resolve(result);
      }
      delete pendingRequests[requestId];
    }
  });

  fastify.register(require('fastify-metrics'), {
    endpoint: '/metrics',
    enableDefaultMetrics: true
  });

  const dbOpsCounter = new client.Counter({ name: 'db_operations_total', help: 'Total DB operations performed' });

  fastify.decorate('db', {
    rocksdbGet: (key) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'rocksdb.get', key });
      }),
    rocksdbPut: (key, value) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'rocksdb.put', key, value });
      }),
    mongoFindOne: (collection, query) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'mongodb.findOne', collectionName: collection, query });
      }),
    mongoDeleteOne: (collection, query) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'mongodb.deleteOne', collectionName: collection, query });
      }),
    mongoInsertOne: (collection, document) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'mongodb.insertOne', collectionName: collection, value: document });
      }),
    mongoUpdateOne: (collection, query, update) =>
      new Promise((resolve, reject) => {
        dbOpsCounter.inc();
        const id = ++requestIdCounter;
        pendingRequests[id] = { resolve, reject };
        process.send({ cmd: 'dbOperation', requestId: id, operation: 'mongodb.updateOne', collectionName: collection, query, value: update });
      })
  });

  fastify.decorate('discordClient', discordClient);
  fastify.addHook('onRequest', (req, reply, done) => {
    req.discordClient = discordClient;
    done();
  });

  const registerRoutes = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        registerRoutes(fullPath);
      } else if (file.endsWith('.js')) {
        const routeModule = require(fullPath);
        fastify.register(routeModule);
      }
    });
  };

  registerRoutes(path.join(__dirname, 'routes'));

  fastify.register(fastifyCors, {
    origin: (origin, callback) => {
      if (
        !origin ||
        [
          'https://dino.economyplus.solutions',
          'https://economyplus.solutions',
          'http://localhost:1113'
        ].includes(origin)
      ) {
        return callback(null, true);
      }
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  });

  fastify.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET,
    hook: 'onRequest',
    parseOptions: {}
  });

  const start = async () => {
    try {
      await fastify.listen({ port: 1112 });
      console.log('Server started on port 1112.');
    } catch (error) {
      console.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    }
  };

  start();
}
