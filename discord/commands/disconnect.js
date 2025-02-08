const { SlashCommandBuilder } = require('discord.js');

const disconnectCommand = require('../modules/fetch/commands/disconnect');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnect your realm(s) from fairplay+'),
	async execute(interaction) {

		const { error, interaction: response } = await disconnectCommand(interaction.guild.id, interaction.locale);

		if (error) return interaction.editReply({ content: 'An error occurred while connecting your realm(s) to fairplay+.' });

		interaction.editReply({ embeds: response.embeds, components: response.buttons });


	},
};
