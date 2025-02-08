const fetch = require('node-fetch');

const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getRealmMemberList(realmID, token) {
    const cacheKey = `realm-${realmID}-club`;
    const currentTime = Date.now();

    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (currentTime - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        } else {
            cache.delete(cacheKey);
        }
    }

    try {
        const response = await fetch(`https://pocket.realms.minecraft.net/worlds/${realmID}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Charset': 'utf-8',
                'Client-Version': '1.17.41',
                'User-Agent': 'MCPE/UWP',
                'Accept-Language': 'en-US',
                'Accept-Encoding': 'gzip, deflate, br',
                'Host': 'pocket.realms.minecraft.net',
                'Authorization': token
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `HTTP ${response.status}: ${errorText}`, members: [] };
        }

        const data = await response.json();

        if (data.error) {
            return { success: false, error: data.error, members: [] };
        }

        const result = { success: true, members: data.players };
        cache.set(cacheKey, { data: result, timestamp: currentTime });

        return result;
    } catch (error) {
        return { success: false, error: error.message, members: [] };
    }
}

module.exports = getRealmMemberList;
