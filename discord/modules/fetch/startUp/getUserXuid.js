const axios = require('axios');

async function getUserXUID(guildID, locale, username) {
    try {
        const response = await axios.post(
            `http://localhost:1112/api/discordbot/xbox/getUserInfo/${guildID}`,
            {
                locale: locale,
                username: username,
            },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { error: false, xuid: response.data.xuid };
    } catch (error) {
        return { error: error.response.data.error, status: error.response.status, error: true, interaction: error.response.data.interaction };
    }
}

module.exports = getUserXUID;
