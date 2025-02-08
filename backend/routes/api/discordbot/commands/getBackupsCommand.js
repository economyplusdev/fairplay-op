const backendSecret = process.env.BACKEND_SECRET;
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const getRealmBackups = require('../../../../modules/helpers/realms/getRealmBackups');
const timeSince = require('../../../../modules/helpers/misc/timeSince');

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/getBackupsCommand', async (req, reply) => {
    try {
      if (req.headers.authorization !== backendSecret) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { guildID } = req.query;
      const { realms } = req.body;
      const realmID = realms[0];

      const backupsResponse = await getRealmBackups(realmID, fastify.db, guildID);

      if (!backupsResponse.success) {
        return reply.status(500).send({ error: 'Failed to retrieve backups' });
      }

      const backups = backupsResponse.data.backups.slice(0, 15);

      if (backups.length === 0) {
        return reply.status(200).send({
          success: true,
          interaction: {
            content: 'No backups available for this realm.',
            components: [],
          },
        });
      }

      const options = backups.map((backup) => {
        const { backupId, lastModifiedDate, size } = backup;

        if (typeof backupId !== 'string') {
          console.error(`Invalid backupId: ${backupId}`);
          return null;
        }

        const lastModified = new Date(lastModifiedDate);
        const timeAgo = timeSince(lastModified);
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);

        return new StringSelectMenuOptionBuilder()
          .setLabel(`Backup ID: ${backupId}`)
          .setDescription(`Size: ${sizeInMB} MB, Last Modified: ${timeAgo}`)
          .setValue(backupId);
      }).filter(option => option !== null);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_backup')
        .setPlaceholder('Select a backup')
        .addOptions(options);

      const actionRow = new ActionRowBuilder().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setTitle('Available Backups')
        .setDescription('Select a backup from the dropdown menu below to view details or perform actions.')
        .setColor(0x0099ff);

      return reply.status(200).send({
        success: true,
        interaction: {
          embeds: [embed],
          components: [actionRow],
        },
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  done();
};
