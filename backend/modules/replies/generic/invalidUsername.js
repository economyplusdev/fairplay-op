const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../config.json');

const tr = require('../../helpers/cloudflare/translateText');

async function invalidUsername(l) {
    const embed = new EmbedBuilder()
        .setTitle(await tr('Invalid Username', l))
        .setDescription(`${emojis.end} ${await tr('This username was not found on the xboxlive network, ensure the username your typing in is a valid Xbox Live Username!', l)} ${emojis.error}`)
        .setColor(colors.error);

    return { embeds: [embed], buttons: [] };
}

module.exports = invalidUsername;
