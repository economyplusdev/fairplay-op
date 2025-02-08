const registerCommands = require('./registerCommands');

async function registerCommandList(guildId) {
    const commands = [
        {
            name: 'connect',
            description: 'Resync/sync Fairplay to your discord server',
            options: []
        },
        {
            name: 'disconnect',
            description: 'Disconnect Fairplay from your discord server',
            options: []
        },
        {
            name: 'realm-ban',
            description: 'Ban a user from a specified realm',
            options: [
                {
                    type: 3, 
                    name: 'username',
                    description: 'The username to ban',
                    required: true,
                    autocomplete: true
                },
                {
                    type: 3, 
                    name: 'time',
                    description: 'The amount of time until the user is unbanned',
                    required: false,
                    autocomplete: true
                },
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm to ban the user from',
                    required: false,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-unban',
            description: 'Unban a user from a specified realm',
            options: [
                {
                    type: 3, 
                    name: 'username',
                    description: 'The username to unban',
                    required: true,
                    autocomplete: true
                },
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm to unban the user from',
                    required: false,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-close',
            description: 'Close one or more of your realms',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want to close',
                    required: false,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-code',
            description: 'Find the invite code for a realm',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want to get the invite code for',
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-open',
            description: 'Open one or more of your realms',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want to open',
                    required: false,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-backup',
            description: 'Backup a realm',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want to backup',
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-players',
            description: 'List all online players in a realm',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want to list players from',
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'realm-join',
            description: 'Have Fairplay connect to your realm(s)',
            options: [
                {
                    type: 3,
                    name: 'realm',
                    description: 'The realm you want Fairplay to join',
                    required: false,
                    autocomplete: true
                }
            ]
        }
    ];

    try {
        await registerCommands(guildId, commands);
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = registerCommandList;
