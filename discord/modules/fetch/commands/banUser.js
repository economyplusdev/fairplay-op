const axios = require('axios');

async function banCommand(guildID, locale, realms, user, userID, time) {
    try {
        const response = await axios.post(
            `http://localhost:1112/api/discordbot/banCommand?guildID=${guildID}`,
            {
                locale: locale,
                realms: realms,
                userID: userID,
                time: time,
                user: {
                    xuid: user.xuid,
                    username: user.username,
                }
            },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { error: false, interaction: response.data.interaction };
    } catch (error) {
        return { error: error.response.data.error, status: error.response.status, error: true };
    }
}

module.exports = banCommand;
