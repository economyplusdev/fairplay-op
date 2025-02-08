
module.exports = (fastify, opts, done) => {
  fastify.get('/api/embeds/getChannelID/:id', async (req, reply) => {
    try {
      if (req.headers.authorization !== process.env.BACKEND_SECRET) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const serverID = req.params.id;
      const realmID = req.query.realmID;
      const channels = await fastify.db.mongoFindOne(`realmLogging_${realmID}`, { guildID: serverID });
      if (!channels) return reply.status(404).send({ success: false, error: 'No channels found' });
      const realmChatChannel = channels.allChannels.find(c => c.type === 'realmChat');
      if (!realmChatChannel) return reply.status(404).send({ success: false, error: 'No realm chat channel found' });
      const channel = await fastify.discordClient.channels.fetch(realmChatChannel.channelID);
      if (!channel) return reply.status(404).send({ success: false, error: 'Channel not found' });
     
      const chanelID = realmChatChannel.channelID

      return reply.send({ success: true, chanelID });
      

    } catch (error) {
      console.log(error);
    }
  });
  done();
};
