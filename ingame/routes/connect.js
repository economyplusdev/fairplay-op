// connect.js
const { spawn } = require('child_process');
const { activeProcesses, processOutputs } = require('../processManager');
async function connectRoutes(fastify, opts) {
  fastify.get('/api/connectClient/:discordID', async (req, reply) => {
    const discordID = req.params.discordID;
    const realmID = req.query.realmID;
    if (activeProcesses.has(realmID)) {
      return reply.status(400).send({ error: `A process for realm ${realmID} is already running.` });
    }
    reply.send({ message: 'fairplay.newEvent.creatingClient' });
    const executablePath = '/root/badping/ingame/client/FP_AMD64_BUILD_oXF001';
    const childProcess = spawn(executablePath, [realmID, discordID], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    activeProcesses.set(realmID, childProcess);
    processOutputs.set(realmID, '');
    childProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      processOutputs.set(realmID, output);
      console.log(`Child STDOUT: ${output}`);
    });
    childProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      processOutputs.set(realmID, output);
      console.error(`Child STDERR: ${output}`);
    });
    childProcess.on('close', (code) => {
      console.log(`Process for realm ${realmID} exited with code: ${code}`);
      activeProcesses.delete(realmID);
    });
    childProcess.on('error', (err) => {
      console.error(`Failed to start process for realm ${realmID}: ${err}`);
    });
  });
}
module.exports = connectRoutes;
