const { SlashCommandBuilder } = require('discord.js');

const createConnection = require('../modules/fetch/commands/createConnection');
const viewConnection = require('../modules/fetch/commands/viewConnection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('realm-join')
		.setDescription('Have Fairplay connect to your realm(s)')
		.addStringOption(option =>
			option.setName('realm')
				.setDescription('The realm you want Fairplay to join')
				.setRequired(false)
		),
	async execute(interaction, commandData) {

		const realms = commandData.realms;

		const responseData = await createConnection(interaction.guild.id, interaction.locale, realms);

		if (responseData.error == true) return interaction.editReply({ content: 'An error occurred while joining your realm(s).' });

		interaction.editReply({ embeds: responseData.interaction.embeds, components: responseData.interaction.buttons });

		let previousEmbeds;
		for (let i = 0; i < 60; i++) {
			const viewData = await viewConnection(interaction.guild.id, interaction.locale, realms);
			if (viewData.error === false) {
				const currentEmbeds = viewData.interaction.embeds;
				if (!previousEmbeds || JSON.stringify(previousEmbeds) !== JSON.stringify(currentEmbeds)) {
					await interaction.editReply({ embeds: currentEmbeds, components: viewData.interaction.buttons });
					previousEmbeds = currentEmbeds;
				}
			}
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		

	},
};
