const backendSecret = process.env.BACKEND_SECRET;
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const determineEmbedColor = require('../../../../modules/helpers/embeds/determineEmbedColor');
const formatStatusDescription = require('../../../../modules/helpers/embeds/formatStatusDescription');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

const restoreRealmBackup = require('../../../../modules/helpers/realms/restoreRealmBackup');

const commandLogs = [
  { channel: 'backup', commands: ['realm-backup'] }
];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/setBackupSlotCommand', async (req, reply) => {
    const commandName = 'realm-backup';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, realms, backupID } = req.body;
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
      const restoreResults = [];
      let clubPicture = '';

      for (const realm of realms) {
        const realmID = parseInt(realm);
        const realmObj = realmsList.realms.find(r => r.id === realmID);
        if (!realmObj) {
          restoreResults.push({
            text: `**${await tr('Unknown Realm', locale)}** ${emojis.error}`,
            success: false
          });
          continue;
        }

        const realmName = stripFormatting(realmObj.name);
        const restoreResult = await restoreRealmBackup(realmID, backupID, fastify.db, guildID);
        const emoji = findEmoji(req.discordClient.guilds.cache.get(guildID), realmID); 
        clubPicture = realmObj.clubPicture;


        restoreResults.push({
          text: `**${realmName}** ${restoreResult.success
            ? `${await tr('has been restored successfully', locale)} ${emoji}`
            : `${await tr('could not be restored', locale)} ${emojis.error}`
          }`,
          success: restoreResult.success
        });
      }

      const embedColor = determineEmbedColor(restoreResults);

      const interactionEmbed = new EmbedBuilder()
        .setTitle(await tr('Restore Backup Command', locale))
        .setColor(embedColor)
        .setThumbnail(clubPicture)
        .setDescription(formatStatusDescription(restoreResults));

      const logEmbed = new EmbedBuilder()
        .setTitle(await tr('Restore Backup Command', locale))
        .setColor(colors.purple)
        .setThumbnail(clubPicture)
        .setDescription(
          `${emojis.reply} ${await tr('Restored by:', locale)} **<@${userID}>**\n\n${formatStatusDescription(restoreResults)}`
        );

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
