const { live, xbl } = require('@xboxreplay/xboxlive-auth');
const findXboxData = require('../xbox/findXboxData');
const xboxClientID = process.env.XBOXCLIENTID;
const xboxClientSecret = process.env.XBOXSECRET;

const cache = new Map();

async function refreshRealmToken(guildID, db) {
    const { userInfo } = await findXboxData(guildID, db);
    const cacheKey = `${guildID}-${userInfo.userData.username}-${userInfo.userData.xuid}`;
    
    if (cache.has(cacheKey) && cache.get(cacheKey).expiresAt > Date.now()) 
        return cache.get(cacheKey);

    const { refresh_token, scope } = userInfo.xboxSessionToken;
    const { access_token } = await live.refreshAccessToken(refresh_token, xboxClientID, scope, xboxClientSecret);
    const { Token: tempToken } = await xbl.exchangeRpsTicketForUserToken(access_token, 'd');
    const { DisplayClaims: { xui }, Token: xts, NotAfter } = await xbl.exchangeTokenForXSTSToken(tempToken, {
        XSTSRelyingParty: 'https://pocket.realms.minecraft.net/',
    });

    const token = `XBL3.0 x=${xui[0].uhs};${xts}`;
    const expiresAt = new Date(NotAfter).getTime();

    const tokenInfo = {
        token,
        expiresAt,
        ownerUUID: userInfo.userData.xuid,
        ownerUsername: userInfo.userData.username
    };

    cache.set(cacheKey, tokenInfo);
    return tokenInfo;
}

module.exports = refreshRealmToken;
