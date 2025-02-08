// disconnect.js
const { activeProcesses } = require('../processManager');

async function disconnectRoutes(fastify, opts) {
  fastify.get('/api/kill/:realmID', async (req, reply) => {
    const realmID = req.params.realmID;
    const childProcess = activeProcesses.get(realmID);
    if (!childProcess) {
      return reply.status(404).send({ error: 'Process not found' });
    }
    childProcess.kill('SIGTERM');
    activeProcesses.delete(realmID);
    reply.send({ message: `Process for realm ${realmID} terminated.` });
  });
}

module.exports = disconnectRoutes;
