// register-command.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect Fairplay to your realm(s)')
    .toJSON(),
  // Add more commands here
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
})();
