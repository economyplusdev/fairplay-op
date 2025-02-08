const { SlashCommandBuilder } = require('discord.js');

const unbanCommand = require('../modules/fetch/commands/unbanUser');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-unban')
		.setDescription('Unban a user from your realm using Fairplay')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('The username to unban')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm to unban the user from')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;
		const xuid = commandData.xuid;

		const responseData = await unbanCommand(interaction.guild.id, interaction.locale, realms, { xuid: xuid, username: commandData.username });

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while unbanning the user from your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });
	},
};
