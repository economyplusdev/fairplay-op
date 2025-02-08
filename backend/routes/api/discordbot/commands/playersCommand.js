const backendSecret = process.env.BACKEND_SECRET;
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');

const getOnlineMembersForRealm = require('../../../../modules/helpers/realms/getOnlineMembersForRealm');
const getPlayerProfiles = require('../../../../modules/helpers/xbox/getPlayerProfiles');

const emptyRealm = require('../../../../modules/replies/generic/commands/emptyRealm');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/playersCommand', async (req, reply) => {
    const commandName = 'realm-players';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, realms } = req.body;

      if (!(await isServerSetup(guildID, fastify.db))) {
        return reply.status(200).send({
          error: 'Server is not setup',
          interaction: await serverNotSetup(locale, guildID),
          success: false
        });
      }

      const realmID = realms[0];

      const realmsList = await getRealmList(guildID, fastify.db);

      const realmProfilePicture = realmsList.realms.find(r => r.id === parseInt(realmID)).clubPicture

      const onlineMembers = await getOnlineMembersForRealm(realmID, guildID, fastify.db);

      if (!onlineMembers.success) {
        return reply.status(200).send({
          success: true,
          interaction: await emptyRealm(locale, realmProfilePicture),
        });
      }

      const userIds = onlineMembers.onlinePlayers.map(player => player.uuid);
      const playerProfiles = await getPlayerProfiles(userIds, guildID, fastify.db);

      if (!playerProfiles.success) {
        return reply.status(200).send({
          success: true,
          interaction: await emptyRealm(locale, realmProfilePicture),
        });
      }



      const playerDescriptions = await Promise.all(playerProfiles.data.map(async profile => {
        const name = profile.settings.find(s => s.id === 'Gamertag')?.value || 'Unknown';
        const gamerscore = profile.settings.find(s => s.id === 'Gamerscore')?.value || '0';
        const permissionLevel = onlineMembers.onlinePlayers.find(p => p.uuid === profile.id)?.permission || 'Unknown';
        return `${emojis.reply} ${await tr('Username:', locale)} **${name}**\n${emojis.end} ${await tr('Permission Level:', locale)} **${permissionLevel}**`;
      }));

      const embed = new EmbedBuilder()
        .setTitle(await tr('Online Players', locale))
        .setThumbnail(realmProfilePicture)
        .setColor(colors.success)
        .setDescription(playerDescriptions.join('\n'));

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
