const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../config.json');

const tr = require('../../helpers/cloudflare/translateText');

async function noPermissionsEmbed(roles, l) {
    const roleMentions = roles.length > 0
        ? roles.map(roleId => `<@&${roleId}>`).join(', ')
        : (`**${await tr('ADMINISTRATOR', l)}**`).toUpperCase();

    const embed = new EmbedBuilder()
        .setTitle(await tr('Insufficient permissions', l))
        .setDescription(`${emojis.reply} ${await tr('You do not have the required permissions to run this command', l)} ${emojis.error}\n${emojis.end} **${await tr('Roles required', l)}:** ${roleMentions}`)
        .setColor(colors.error);

    return { embeds: [embed], buttons: [] };
}

module.exports = noPermissionsEmbed;
