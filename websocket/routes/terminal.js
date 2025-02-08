// routes/terminal.js
const verifyAuthentication = require("../modules/auth/verifyAuthenticationStatus");
const getMemberList = require("../modules/auth/getMemberList");

module.exports = (fastify, opts, done) => {
  fastify.get('/terminal', { websocket: true }, (socket, req) => {
    fastify.activeConnectionsGauge.inc();
    socket.send(JSON.stringify({ command: 'Fairplay.NewEvent.AwaitingAuthentication' }));
    socket.on('message', async (e) => {
      try {
        const message = JSON.parse(e);
        if (message?.authenticate === true) {
          const auth = await verifyAuthentication(message.guildID, message.realmID, message.authentication);
          if (auth.success) {
            socket.send(JSON.stringify({ command: 'Fairplay.NewEvent.AuthenticationSuccess' }));
            const memberList = await getMemberList(message.realmID);
            socket.send(`Hello, current members online: ${memberList.length}/10`);
            socket.send(`Type 'help' to see available commands`);
            socket.authenticated = true;
            socket.realmID = message.realmID;
          } else {
            socket.send(JSON.stringify({ command: 'Fairplay.NewEvent.AuthenticationFailed', error: auth.error }));
            socket.close();
          }
        }
      } catch (error) {
        if (socket.authenticated === true) {
          if (e === 'help') {
            socket.send('Available commands: help, close, list, clear, say');
          } else if (e === 'close') {
            socket.send('Closing connection...');
            socket.close();
          } else if (e === 'list') {
            const memberList = await getMemberList(socket.realmID);
            socket.send(`Current players online: ${memberList.length}/10`);
            socket.send(memberList.join(', '));
          } else if (e === 'clear') {
            socket.send('Terminal cleared');
          } else if (e === 'say') {
            
          } else {
            socket.send("Unknown command, type 'help' to see available commands");
          }
        }
      }
    });
    socket.on('close', () => {
      fastify.activeConnectionsGauge.dec();
    });
  });
  done();
};
