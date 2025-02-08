const { SlashCommandBuilder } = require('discord.js');

const realmCodeCommand = require('../modules/fetch/commands/getRealmCode');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-code')
		.setDescription('Find the invite code for one of your realms')
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm you want to get the invite code for')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;

		const responseData = await realmCodeCommand(interaction.guild.id, interaction.locale, realms);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while closing your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });
	},
};
