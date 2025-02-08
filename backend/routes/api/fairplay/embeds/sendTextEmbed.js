const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');
const messageTimestamps = {};

module.exports = (fastify, opts, done) => {
  fastify.post('/api/embeds/sendTextEmbed/:id', async (req, reply) => {
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
      const now = Date.now();
      if (!messageTimestamps[channel.id]) {
        messageTimestamps[channel.id] = [];
      }
      messageTimestamps[channel.id] = messageTimestamps[channel.id].filter(ts => now - ts < 5000);
      if (messageTimestamps[channel.id].length >= 3) {
        return reply.status(429).send({ success: false, error: 'Rate limit exceeded. Only 3 messages per 5 seconds allowed.' });
      }
      messageTimestamps[channel.id].push(now);
      const embed = new EmbedBuilder().setColor(colors.purple).setDescription(req.body.text);
      await channel.send({ embeds: [embed] });
      return reply.send({ success: true });
    } catch (error) {
      console.log(error);
    }
  });
  done();
};
