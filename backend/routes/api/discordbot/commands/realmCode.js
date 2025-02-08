const backendSecret = process.env.BACKEND_SECRET;

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const getRealmCode = require('../../../../modules/helpers/realms/getRealmCode');

const tr = require('../../../../modules/helpers/cloudflare/translateText');

const commandLogs = [
  { channel: 'realmcode', commands: ['realm-code'] }
];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/realmCodeCommand', async (req, reply) => {
    const commandName = 'realm-close';
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { locale, realms } = req.body;
      const userID = req.body.userID;

      const realm = realms[0];

      if (!(await isServerSetup(guildID, fastify.db))) {
        return reply.status(200).send({
          error: 'Server is not setup',
          interaction: await serverNotSetup(locale, guildID),
          success: false
        });
      }

      const realmsList = await getRealmList(guildID, fastify.db);

      const realmProfilePicture = realmsList.realms.find(r => r.id === parseInt(realm)).clubPicture

      const realmCodeData = await getRealmCode(realm, guildID, fastify.db);

      const realmCode = realmCodeData.realmData.find(r => r.type === 'INFINITE')?.linkId;

      if(!realmCode) {
          const embed = new EmbedBuilder()
            .setTitle(`${await tr('Realm Code', locale)}`)
            .setThumbnail(realmProfilePicture)
            .setDescription(`${emojis.end} ${await tr('No realm code found for this realm', locale)}`)
            .setColor(colors.error);
          return reply.status(200).send({ success: false, interaction: { embeds: [embed], components: [] } });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${await tr('Realm Code', locale)}`)
        .setThumbnail(realmProfilePicture)
        .setDescription(`${emojis.reply} ${await tr('Here is the realm code for this realm:', locale)}\n${emojis.end} \`${realmCode}\``)
        .setColor(colors.success);


      return reply.status(200).send({ success: true, interaction: { embeds: [embed], components: [] } });

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  done();
};
