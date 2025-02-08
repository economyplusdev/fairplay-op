const fetch = require('node-fetch');
const refreshRealmToken = require('../../authentication/tokens/refreshRealmToken');
const refreshXboxToken = require('../../authentication/tokens/refreshXboxToken');
const getClubInfo = require('../xbox/getClubInfo');
const getRealmMemberList = require('./getRealmMemberList');
const getOnlineMembers = require('./getOnlineMembers');

const cache = new Map();

async function getRealmList(serverID, db) {
    const cacheKey = `realmList_${serverID}`;
    const now = Date.now();

    if (cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        if (now - cachedEntry.timestamp < 3600 * 1000) {
            return cachedEntry.data;
        } else {
            cache.delete(cacheKey);
        }
    }

    const TokenInfo = await refreshRealmToken(serverID, db);
    const xboxTokenInfo = await refreshXboxToken(serverID, db);
    const realmToken = TokenInfo.token;
    const xboxToken = xboxTokenInfo.token;
    const ownerUUID = TokenInfo.ownerUUID;
    const ownerUsername = TokenInfo.ownerUsername;

    const response = await fetch('https://pocket.realms.minecraft.net/worlds', {
        headers: {
            'Cache-Control': 'no-cache',
            'Charset': 'utf-8',
            'Client-Version': '1.17.41',
            'User-Agent': 'MCPE/UWP',
            'Accept-Language': 'en-US',
            'Accept-Encoding': 'gzip, deflate, br',
            'Host': 'pocket.realms.minecraft.net',
            'Authorization': realmToken
        }
    });

    const data = await response.json();

    if (data.error) {
        return { success: false, error: data.error, realms: [] };
    }

    let ownedRealms = data.servers.filter(server => server.ownerUUID.includes(ownerUUID));

    if (ownedRealms.length === 0) {
        return { success: false, error: `The account: ${ownerUsername}, does not seem to own any realms`, realms: [] };
    }

    const onlineMembers = await getOnlineMembers(realmToken);

    for (let i = 0; i < ownedRealms.length; i++) {
        const clubID = ownedRealms[i].clubId;
        ownedRealms[i].clubPicture = await getClubInfo(clubID, xboxToken);
        const realmMembers = await getRealmMemberList(ownedRealms[i].id, realmToken);
        let realmPlayers = {
            accepted: 0,
            pending: 0,
            onlinePlayers: []
        };
        realmMembers.members.forEach(member => {
            if (member.accepted === true) {
                realmPlayers.accepted++;
            } else {
                realmPlayers.pending++;
            }
        });
        const server = onlineMembers.servers.find(s => s.id === ownedRealms[i].id);
        realmPlayers.onlinePlayers = server ? server.players : [];
        ownedRealms[i].players = realmPlayers;
    }

    const result = { success: true, realms: ownedRealms };
    cache.set(cacheKey, { data: result, timestamp: now });
    return result;
}

module.exports = getRealmList;
