const fetch = require('node-fetch');

async function getDiscordGuilds(accessToken) {

    const headers = {
        Authorization: `Bearer ${accessToken}`,
    }

    const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify({ status: response.status, data: responseData }));
    }

    return responseData;
}

module.exports = getDiscordGuilds;