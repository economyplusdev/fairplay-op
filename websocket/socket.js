// socket.js
const Fastify = require('fastify');
const fastifyWebsocket = require('@fastify/websocket');
const { Client, GatewayIntentBits } = require('discord.js');
const clientMetrics = require('prom-client');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const fastify = Fastify();
fastify.register(fastifyWebsocket);

const getChannelID = require('./modules/fetch/getChannelID');

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const messageCounter = new clientMetrics.Counter({
  name: 'discord_messages_total',
  help: 'Total number of Discord messages received'
});

const activeConnectionsGauge = new clientMetrics.Gauge({
  name: 'active_websocket_connections',
  help: 'Number of users connected to the interactive terminal'
});

const websocketMessagesCounter = new clientMetrics.Counter({
  name: 'websocket_messages_total',
  help: 'Total number of messages sent through the websocket'
});

const textPackets = new clientMetrics.Counter({
  name: 'text_messages_total',
  help: 'Total number in which is classified as "text"'
});

const tellrawPackets = new clientMetrics.Counter({
  name: 'tellraw_messages_total',
  help: 'Total number in which is classified as "tellraw"'
});

const wsConnections = new Set();

fastify.decorate('activeConnectionsGauge', activeConnectionsGauge);
fastify.decorate('websocketMessagesCounter', websocketMessagesCounter);
fastify.decorate('wsConnections', wsConnections);
fastify.decorate('tellrawPackets', tellrawPackets);
fastify.decorate('textPackets', textPackets);

discordClient.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  messageCounter.inc();
  for (const socket of wsConnections) {
    const socketRealmID = socket.realmID;
    const socketDiscordID = socket.discordID;
    const messageGuildID = message.guild.id;

    const selectedChannel = await getChannelID(socketRealmID, messageGuildID);
    const selectedChannelID = selectedChannel.channelID;

    if (selectedChannelID === message.channel.id && socketDiscordID === messageGuildID) {
      const tellrawComponent = { rawtext: [{ text: message.content }] };
      const command = `tellraw @a ${JSON.stringify(tellrawComponent)}`;
      socket.send(JSON.stringify({
        command: 'Fairplay.NewEvent.DiscordMessage',
        data: { message: command }
      }));
      
    }
  }
});

discordClient.login(process.env.discordToken);

fastify.get('/metrics', async (req, reply) => {
  reply.header('Content-Type', clientMetrics.register.contentType);
  return clientMetrics.register.metrics();
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

const start = async () => {
  try {
    await fastify.listen({ port: 6969 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
