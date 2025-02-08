const { SlashCommandBuilder } = require('discord.js');

const openRealm = require('../modules/fetch/commands/openRealm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-open')
		.setDescription('Open one or more of your realms')
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm you want to open')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;

		const responseData = await openRealm(interaction.guild.id, interaction.locale, realms);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while opening your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });
	},
};
