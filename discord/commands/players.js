const { SlashCommandBuilder } = require('discord.js');

const onlinePlayers = require('../modules/fetch/commands/onlinePlayers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-players')
		.setDescription('List all online players in a realm')
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm you want to list players from')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;

		const responseData = await onlinePlayers(interaction.guild.id, interaction.locale, realms);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while fetching online players your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });
	},
};
