const { SlashCommandBuilder } = require('discord.js');

const banCommand = require('../modules/fetch/commands/banUser');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-ban')
		.setDescription('Ban a user from your realm using Fairplay')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('The username to ban')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('time')
				.setDescription('The amount of time until the user is unbanned')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm to ban the user from')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;
		const xuid = commandData.xuid;
		const time = commandData.time;

		const responseData = await banCommand(interaction.guild.id, interaction.locale, realms, { xuid: xuid, username: commandData.username }, interaction.user.id, time);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while banning the user from your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });

		return { true: true };
	},
};
