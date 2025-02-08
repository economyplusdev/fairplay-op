const axios = require('axios');

async function checkPermissions(guildID, userRoles, userHasAdministrator, commandName, locale) {
    try {
        const response = await axios.post(
            `http://localhost:1112/api/discordbot/checkPermissions/${guildID}`,
            {
                roles: userRoles,
                hasAdminstator: userHasAdministrator,
                commandName: commandName,
                locale: locale,
            },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { hasPermission: response.data.hasPermission, error: false, interaction: response.data.interaction };
    } catch (error) {
        return { error: error.response.data.error, status: error.response.status, error: true };
    }
}

module.exports = checkPermissions;
