// lastOutput.js
const { processOutputs } = require('../processManager');

async function lastOutputRoutes(fastify, opts) {
  fastify.get('/api/lastOutput/:realmID', async (req, reply) => {
    const realmID = req.params.realmID;
    const lastOutput = processOutputs.get(realmID);
    if (!lastOutput) {
      return reply.status(404).send({ error: 'No output found for this process.' });
    }
    reply.send({ message: `Last output for realm ${realmID}`, output: lastOutput });
  });
}

module.exports = lastOutputRoutes;
