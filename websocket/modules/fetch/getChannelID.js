const axios = require('axios');

async function getChannelID(realmID, guildID) {
    try {
        const response = await axios.get(
            `http://localhost:1112/api/embeds/getChannelID/${guildID}?realmID=${realmID}`,
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

    
        return { error: false, channelID: response.data.chanelID };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

module.exports = getChannelID;
