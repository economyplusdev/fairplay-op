const fetch = require('node-fetch');

async function getDiscordProfile(accessToken) {

    const headers = {
        Authorization: `Bearer ${accessToken}`,
    }

    const response = await fetch('https://discord.com/api/users/@me', {
        headers: headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify({ status: response.status, data: responseData }));
    }

    return responseData;
}

module.exports = getDiscordProfile;