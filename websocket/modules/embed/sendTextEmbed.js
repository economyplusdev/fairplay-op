const axios = require('axios');

async function sendTextEmbed(text, realmID, guildID) {
    try {
        const response = await axios.post(
            `http://localhost:1112/api/embeds/sendTextEmbed/${guildID}?realmID=${realmID}`,
            {
                text: text,
            },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

    
        return { error: false };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

module.exports = sendTextEmbed;
