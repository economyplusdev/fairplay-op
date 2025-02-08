const { REST, Routes } = require('discord.js');

/**
 * Registers commands for a specific guild.
 * @param {string} token - The bot token.
 * @param {string} clientId - The bot's application/client ID.
 * @param {string} guildId - The guild ID where commands are being registered.
 * @param {Array} commands - The array of commands to register.
 */

const token = process.env.discordToken;
const clientId = process.env.clientID;

async function registerCommands(guildId, commands) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = registerCommands;
