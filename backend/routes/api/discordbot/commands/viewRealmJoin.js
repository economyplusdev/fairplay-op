const backendSecret = process.env.BACKEND_SECRET;

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');

const viewConnection = require('../../../../modules/helpers/realms/gopher/viewConnection');
const getTranslation = require('../../../../translations');


const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const formatStatusDescription = require('../../../../modules/helpers/embeds/formatStatusDescription');
const determineEmbedColor = require('../../../../modules/helpers/embeds/determineEmbedColor');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

const commandLogs = [
  { channel: 'realmjoin', commands: ['realm-join'] }
];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/viewRealmJoin', async (req, reply) => {
    const commandName = 'realm-join';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, user, realms } = req.body;

      const serverSetup = await isServerSetup(guildID, fastify.db);
      if (!serverSetup) {
        return reply.status(200).send({
          error: 'Server is not setup',
          interaction: await serverNotSetup(locale, guildID),
          success: false
        });
      }

      const realmsList = await getRealmList(guildID, fastify.db);
      let connectionStatus = []


      for (let i = 0; i < realms.length; i++) {
        const realmID = parseInt(realms[i]);

        const realmObj = realmsList.realms.find(r => r.id === realmID);
        if (!realmObj) {
          connectionStatus.push({
            text: `${await tr('Could not join realm', locale)} **Unknown Realm** ${emojis.error}`,
            success: false
          });
          continue;
        }

        const realmName = stripFormatting(realmObj.name);
        const emoji = findEmoji(req.discordClient.guilds.cache.get(guildID), realmID);

        const connectionResult = await viewConnection(realmID);
        if (!connectionResult.success) {
          connectionStatus.push({
            text: `${await tr('Could not join realm', locale)} **${realmName}** ${emojis.error}`,
            success: false
          });
          continue;
        }
        
        const message = getTranslation(connectionResult.message).message
        const isSuccess = getTranslation(connectionResult.message).success
        connectionStatus.push({
          text: `${await tr(message, locale)} **${realmName}** ${emoji}`,
          success: isSuccess
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(await tr('Join Command', locale))
        .setColor(determineEmbedColor(connectionStatus, { success: colors.success, error: colors.warning, warning: colors.warning }))
        .setDescription(formatStatusDescription(connectionStatus, locale));

      return reply.status(200).send({
        interaction: {
          embeds: [embed],
          buttons: [],
        },
        success: true
      });

    
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  done();
};
