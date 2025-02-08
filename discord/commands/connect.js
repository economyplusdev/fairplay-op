const { SlashCommandBuilder } = require('discord.js');

const connectCommand = require('../modules/fetch/commands/connect');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect your realm(s) to fairplay+'),
	async execute(interaction) {

		const { error, interaction: response } = await connectCommand(interaction.guild.id, interaction.locale);

		if (error) return interaction.editReply({ content: 'An error occurred while connecting your realm(s) to fairplay+.' });

		interaction.editReply({ embeds: response.embeds, components: response.buttons });


	},
};
