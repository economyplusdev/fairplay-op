const axios = require('axios');

async function askForRealms(guildID, locale) {
    try {
        const response = await axios.post(
            `http://localhost:1112/api/discordbot/askForRealms/${guildID}`,
            {
                locale: locale,
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

module.exports = askForRealms;
