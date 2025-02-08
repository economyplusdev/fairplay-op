const { SlashCommandBuilder } = require('discord.js');

const closeCommand = require('../modules/fetch/commands/closeRealm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-close')
		.setDescription('Close one or more of your realms')
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm you want to close')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;

		const responseData = await closeCommand(interaction.guild.id, interaction.locale, realms);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while closing your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });
	},
};
