const { SlashCommandBuilder, ComponentType } = require('discord.js');

const getBackupSlots = require('../modules/fetch/commands/getBackupSlots');
const setBackupSlot = require('../modules/fetch/commands/setBackupSlot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realm-backup')
    .setDescription('Backup to a previous world save using Fairplay')
    .addStringOption(option =>
      option.setName('realm')
        .setDescription('The realm to backup')
        .setRequired(true)
    ),
  async execute(interaction, commandData) {
    const realms = commandData.realms;
    const responseData = await getBackupSlots(interaction.guild.id, interaction.locale, realms);

    if (responseData.error) {
      return interaction.editReply({ content: 'An error occurred while retrieving the backup slots.' });
    }

    const message = await interaction.editReply({
      embeds: responseData.interaction.embeds,
      components: responseData.interaction.components,
    });

    const filter = i => i.customId === 'select_backup' && i.user.id === interaction.user.id;

    const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 300000 });

    collector.on('collect', async i => {
      const selectedBackupId = i.values[0];
	  await i.deferUpdate();

	  await interaction.editReply({ embeds: responseData.interaction.embeds, components: [] });

		const setBackupSlotResponse = await setBackupSlot(interaction.guild.id, interaction.locale, realms, selectedBackupId);

	  if (setBackupSlotResponse.error) {
		return await i.update({ content: 'An error occurred while setting the backup slot.' });
	  }

	  await interaction.editReply({ embeds: setBackupSlotResponse.interaction.embeds, components: setBackupSlotResponse.interaction.components });

    });

    collector.on('end', collected => {
      console.log(`Collector ended. Collected ${collected.size} interactions.`);
    });
  },
};
