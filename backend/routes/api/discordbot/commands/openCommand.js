const backendSecret = process.env.BACKEND_SECRET;

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const openRealm = require('../../../../modules/helpers/realms/openRealm');

const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const formatStatusDescription = require('../../../../modules/helpers/embeds/formatStatusDescription');
const determineEmbedColor = require('../../../../modules/helpers/embeds/determineEmbedColor');
const getUserPfP = require('../../../../modules/helpers/xbox/getUserPfP');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

const commandLogs = [
  { channel: 'close/open', commands: ['realm-open'] }
];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/openCommand', async (req, reply) => {
    const commandName = 'realm-open';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, user, realms } = req.body;
      const { username } = user;
      const userID = req.body.userID;

      if (!(await isServerSetup(guildID, fastify.db))) {
        return reply.status(200).send({
          error: 'Server is not setup',
          interaction: await serverNotSetup(locale, guildID),
          success: false
        });
      }

      const closeResults = [];
      const realmsList = await getRealmList(guildID, fastify.db);

      for (const realm of realms) {
        const realmID = parseInt(realm);
        const realmObj = realmsList.realms.find(r => r.id === realmID);

        if (!realmObj) {
          closeResults.push({
            text: `${await tr('Could not open realm', locale)} **Unknown Realm** ${emojis.error}`,
            success: false
          });
          continue;
        }

        const realmName = stripFormatting(realmObj.name);
        const closeResult = await openRealm(realmID, fastify.db, guildID);
        const emoji = findEmoji(req.discordClient.guilds.cache.get(guildID), realmID);

        if (closeResult.success) {
          closeResults.push({
            text: `${await tr('Opened', locale)} **${realmName}** ${emoji}`,
            success: true
          });
        } else {
          closeResults.push({
            text: `${await tr('Could not open', locale)} **${realmName}** ${emojis.error}`,
            success: false
          });
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(await tr('Open Command', locale))
        .setColor(determineEmbedColor(closeResults))
        .setDescription(formatStatusDescription(closeResults));

      const pfp = await getUserPfP(username, guildID, fastify.db);
      const logEmbed = new EmbedBuilder()
        .setTitle(await tr('Open Command', locale))
        .setColor(colors.purple)
        .setThumbnail(pfp.data)
        .setDescription(`${emojis.end} ${await tr('Opened by:', locale)} **<@${userID}>**\n\n${formatStatusDescription(closeResults)}`);

      const serverChannel = await fastify.db.mongoFindOne('discordDataLogging', { guildID });
      const channelType = commandLogs.find(log => log.commands.includes(commandName));
      const channelToSendLogs = serverChannel?.allChannels.find(channel => channel.type === channelType.channel);

      const discordClient = req.discordClient;
      const channel = discordClient.channels.cache.get(channelToSendLogs?.channelID);
      if (channel && typeof channel.send === 'function') {
        channel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      return reply.status(200).send({
        success: true,
        interaction: {
          embeds: [embed],
          buttons: []
        }
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  done();
};
