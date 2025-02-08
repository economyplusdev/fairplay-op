const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const tr = require('../../../helpers/cloudflare/translateText');

async function emptyRealm(l, realmProfilePicture) {
    const embed = new EmbedBuilder()
        .setTitle(await tr('No Online Players', l))
        .setThumbnail(realmProfilePicture)
        .setDescription(`${emojis.end} ${await tr('Fairplay was unable to find who is online in the realm, this realm may be empty.', l)}`)
        .setColor(colors.error);

    return { embeds: [embed], buttons: [] };
}

module.exports = emptyRealm;
