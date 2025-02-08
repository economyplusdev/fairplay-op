const fetch = require('node-fetch');

const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;
const discordRedirect = process.env.discordRedirect;

async function validateDiscordToken(code) {
    const discordTokenData = new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: discordRedirect,
    });

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: headers,
        body: discordTokenData,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify({ status: response.status, data: responseData }));
    }

    return responseData;
}

module.exports = validateDiscordToken;
