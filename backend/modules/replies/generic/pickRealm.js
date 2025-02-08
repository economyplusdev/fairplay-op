const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { emojis, colors } = require('../../../config.json');
const tr = require('../../helpers/cloudflare/translateText');

async function pickRealm(l, realms) {
  const embed = new EmbedBuilder()
    .setTitle(await tr('Select a realm', l))
    .setDescription(`${emojis.end} ${await tr('Pick the Realm(s) you would like to execute this action on', l)}`)
    .setColor(colors.warning);

  const options = await Promise.all(
    realms.map(async (realm) => ({
      label: realm.name,
      description: await tr('Execute this action on this realm', l),
      value: `${realm.id}`,
      emoji: realm.emoji,
    }))
  );

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('realm')
      .setPlaceholder(await tr('Select a realm', l))
      .setMinValues(1)
      .setMaxValues(realms.length)
      .addOptions(options)
  );

  return { embeds: [embed], components: [row] };
}

module.exports = pickRealm;
