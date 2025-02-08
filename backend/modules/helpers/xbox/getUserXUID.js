const fetch = require('node-fetch');

const refreshXboxToken = require('../../authentication/tokens/refreshXboxToken');

async function getUserXUID(gamertag, guildID, db) {
    try {
        const xboxToken = await refreshXboxToken(guildID, db);
        const auth = {
            'x-xbl-contract-version': '2',
            'Authorization': xboxToken.token,
            'Accept-Language': 'en-US'
        };
        const url = `https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw`;
        const response = await fetch(url, { headers: auth });
        const res = await response.json();
        const xuid = res?.profileUsers?.[0]?.id;
        return { data: xuid, success: true, fromCache: false };
    } catch (error) {
        console.error(error);
        return { error: error.message, success: false };
    }
}

module.exports = getUserXUID;
