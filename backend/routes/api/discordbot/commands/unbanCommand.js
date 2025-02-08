const backendSecret = process.env.BACKEND_SECRET;

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const unbanUser = require('../../../../modules/helpers/realms/unbanUser');

const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const formatStatusDescription = require('../../../../modules/helpers/embeds/formatStatusDescription');
const determineEmbedColor = require('../../../../modules/helpers/embeds/determineEmbedColor');
const getUserPfP = require('../../../../modules/helpers/xbox/getUserPfP');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

const commandLogs = [
  { channel: 'ban/unban', commands: ['realm-ban', 'realm-unban'] }
];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/unbanCommand', async (req, reply) => {
    const commandName = 'realm-unban';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, user, realms } = req.body;
      const { xuid, username } = user;
      const userID = req.body.userID;

      const serverSetup = await isServerSetup(guildID, fastify.db);
      if (!serverSetup) {
        return reply.status(200).send({
          error: 'Server is not setup',
          interaction: await serverNotSetup(locale, guildID),
          success: false
        });
      }

      const realmsList = await getRealmList(guildID, fastify.db);
      const unbanResults = [];

      for (const realm of realms) {
        const realmID = parseInt(realm);
        const realmObj = realmsList.realms.find(r => r.id === realmID);
        if (!realmObj) {
          unbanResults.push({
            text: `**${username}** ${await tr('could not be unbanned from', locale)} **Unknown Realm** ${emojis.error}`,
            success: false
          });
          continue;
        }

        const realmName = stripFormatting(realmObj.name);
        const unbanResult = await unbanUser(realmID, xuid, fastify.db, guildID);
        const emoji = findEmoji(req.discordClient.guilds.cache.get(guildID), realmID);

        unbanResults.push({
          text: `**${username}** ${unbanResult.success
            ? `${await tr('has been unbanned from', locale)} **${realmName}** ${emoji}`
            : `${await tr('could not be unbanned from', locale)} **${realmName}** ${emojis.error}`
          }`,
          success: unbanResult.success
        });
      }

      const pfp = await getUserPfP(username, guildID, fastify.db);
      const embedColor = determineEmbedColor(unbanResults);

      const interactionEmbed = new EmbedBuilder()
        .setTitle(await tr('Unban Command', locale))
        .setThumbnail(pfp.data)
        .setColor(embedColor)
        .setDescription(formatStatusDescription(unbanResults));

      const logEmbed = new EmbedBuilder()
        .setTitle(await tr('Unban Command', locale))
        .setColor(colors.purple)
        .setThumbnail(pfp.data)
        .setDescription(`${emojis.end} ${await tr(`Unbanned by:`, locale)} **<@${userID}>**\n\n${formatStatusDescription(unbanResults)}`);

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
          embeds: [interactionEmbed],
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
