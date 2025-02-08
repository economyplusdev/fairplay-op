const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { emojis, colors } = require('../../../config.json');

const tr = require('../../helpers/cloudflare/translateText');

async function serverNotSetup(l, guildID) {
    const embed = new EmbedBuilder()
        .setTitle(await tr('Server not setup!', l))
        .setDescription(`${emojis.end} ${await tr('This server has not been setup yet, click the buton below to setup Fairplay for this discord server!', l)} ${emojis.error}`)
        .setColor(colors.error);

    const button = new ButtonBuilder()
        .setLabel(`${await tr('Setup Fairplay', l)}`)
        .setURL(`http://localhost:1112/api/discord/create?redirect=http://localhost:1112/api/create/xbox?guildID=${guildID}`)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(button);

    return { embeds: [embed], buttons: [row] };
}

module.exports = serverNotSetup;
