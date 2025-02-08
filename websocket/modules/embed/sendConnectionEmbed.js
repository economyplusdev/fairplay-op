const axios = require('axios');

let lastSendTime = 0;
const throttleInterval = 3000;

async function sendConnectionEmbed(isConnected, realmID, guildID) {
    const now = Date.now();
    if (now - lastSendTime < throttleInterval) {
        return { error: false, message: "Request throttled" };
    }
    lastSendTime = now;
    try {
        await axios.post(
            `http://localhost:1112/api/embeds/sendConnectionEmbed/${guildID}?realmID=${realmID}`,
            { isConnected: isConnected },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );
        return { error: false };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

module.exports = sendConnectionEmbed;
