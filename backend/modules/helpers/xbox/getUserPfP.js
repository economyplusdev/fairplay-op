const fetch = require('node-fetch');

const refreshXboxToken = require('../../authentication/tokens/refreshXboxToken');
const uploadImage = require('../cloudflare/uploadImage');

async function getUserPfP(gamertag, guildID, db) {
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
        const imageUrl = res?.profileUsers[0]?.settings[0]?.value;
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.buffer();
        const pfp = await uploadImage(imageData, `${gamertag}.png`);
        return { data: pfp, success: true, fromCache: false };
    } catch (error) {
        return { error: error.message, success: false };
    }
}

module.exports = getUserPfP;
