require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const path = require('path');
const fs = require('fs');


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
        await fastify.listen({ port: 4444 });
        console.log('Server started on port 4444.');
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

start();