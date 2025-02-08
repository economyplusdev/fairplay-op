const { Client, Collection, Events, GatewayIntentBits, Options } = require('discord.js');
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
const { readdirSync } = require('fs');
const path = require('path');
require('dotenv').config();
const checkPermissions = require('./modules/fetch/startUp/checkPermissions');
const fetchAutoCompletions = require('./modules/fetch/startUp/fetchAutoComplete');
const askForRealms = require('./modules/fetch/startUp/askForRealms');
const getUserXUID = require('./modules/fetch/startUp/getUserXuid');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
  makeCache: Options.cacheWithLimits(Options.DefaultMakeCacheSettings),
  sweepers: Options.DefaultSweeperSettings
});

client.cluster = new ClusterClient(client);
client.commands = new Collection();

readdirSync(path.join(__dirname, 'commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(path.join(__dirname, 'commands', file));
    client.commands.set(command.data.name, command);
  });

client.once(Events.ClientReady, () => console.log(`Logged in as ${client.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: 'Command not found.', ephemeral: true });
  await interaction.deferReply();

  try {
    const permissionCheck = await checkPermissions(
      interaction.guild.id,
      interaction.member.roles.cache.map(role => role.id),
      interaction.member.permissions.has('ADMINISTRATOR'),
      interaction.commandName,
      interaction.locale
    );

    if (!permissionCheck.hasPermission) {
      return interaction.editReply({
        embeds: permissionCheck.interaction.embeds,
        components: permissionCheck.interaction.buttons
      });
    }

    const commandsToAskForRealms = ['realm-ban', 'realm-unban', 'realm-close', 'realm-open', 'realm-backup', 'realm-players', 'realm-code', 'realm-join'];
    let realmSelectedtoSend = null;

    const proceedWithCommand = async () => {
      const username = interaction.options.getString('username');
      const timeComponent = interaction.options.getString('time');
      let xuid = null;
      if (username) {
        const xuidResponse = await getUserXUID(interaction.guild.id, interaction.locale, username);
        if (xuidResponse.error) {
          return interaction.editReply({ embeds: xuidResponse.interaction.embeds });
        }
        xuid = xuidResponse.xuid;
      }
      await command.execute(interaction, { realms: realmSelectedtoSend, xuid: xuid, username: username, time: timeComponent });
    };

    if (commandsToAskForRealms.includes(interaction.commandName)) {
      const realmsSelected = interaction.options.getString('realm');
      if (realmsSelected) {
        realmSelectedtoSend = [realmsSelected];
        await proceedWithCommand();
      } else {
        const realms = await askForRealms(interaction.guild.id, interaction.locale);
        if (realms.error) {
          return interaction.editReply({ content: 'An error occurred while fetching your realms.' });
        }
        const replyMessage = await interaction.editReply({
          embeds: realms.interaction.embeds,
          components: realms.interaction.components
        });
        const filter = i => i.user.id === interaction.user.id && i.customId === 'realm';
        const collector = replyMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
          realmSelectedtoSend = i.values;
          await i.deferUpdate();
          interaction.editReply({ embeds: realms.interaction.embeds, components: [] });
          collector.stop('realmSelected');
        });

        collector.on('end', async (collected, reason) => {
          if (reason === 'realmSelected' && realmSelectedtoSend) {
            try {
              await proceedWithCommand();
            } catch (error) {
              console.error(error);
              await interaction.editReply({ content: 'Error executing command.' });
            }
          } else {
            await interaction.editReply({
              content: 'You took too long to pick a realm.',
              components: []
            });
          }
        });
      }
    } else {
      await proceedWithCommand();
    }
  } catch (error) {
    console.error(error);
    interaction.editReply({ content: 'Error executing command.', ephemeral: true });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isAutocomplete()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  const searchValue = interaction.options.getFocused();
  const searchName = interaction.options.getFocused(true).name;
  const guildID = interaction.guild.id;
  const autoCompletions = await fetchAutoCompletions(guildID, searchName, searchValue);

  try {
    return interaction.respond(autoCompletions.autoCompletions);
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.DISCORDBOTTOKEN);
