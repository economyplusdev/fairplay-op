const newDefaultMessageEvent = require('../modules/events/newDefaultMessageEvent');
const sendConnectionEmbed = require('../modules/embed/sendConnectionEmbed');

module.exports = (fastify, opts, done) => {
  fastify.get('/fairplay', { websocket: true }, (socket) => {
    fastify.activeConnectionsGauge.inc();
    fastify.wsConnections.add(socket);

    socket.send(JSON.stringify({ command: 'Fairplay.NewEvent.AwaitingAuthentication' }));

    socket.on('message', async (e) => {

      fastify.websocketMessagesCounter.inc();

      try {
        const message = JSON.parse(e);
        if (message?.authenticate === true) {
          const realmID = message.realmID;
          const discordID = message.discordID;

          await sendConnectionEmbed(true, realmID, discordID);
          socket.send(JSON.stringify({ command: 'Fairplay.NewEvent.AuthenticationSuccess' }));
          socket.realmID = realmID;
          socket.discordID = discordID;
          socket.authenticated = true
        }
        if (message.type == 'text') return newDefaultMessageEvent(message.data, { realmID: socket.realmID, discordID: socket.discordID }, fastify);


      } catch (error) {
        console.log(error);
      }
    })

    socket.on('close', () => {

      if (socket.authenticated) {
        sendConnectionEmbed(false, socket.realmID, socket.discordID)
      }

      fastify.activeConnectionsGauge.dec();
      fastify.wsConnections.delete(socket);
    });
  });
  done();
};
