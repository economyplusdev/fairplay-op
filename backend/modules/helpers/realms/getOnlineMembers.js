const fetch = require('node-fetch');

const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getOnlineMembers(token) {
    const cacheKey = `realm-${token}`;
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
        const response = await fetch(`https://pocket.realms.minecraft.net/activities/live/players`, {
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
            return { success: false, error: `HTTP ${response.status}: ${errorText}`, servers: [] };
        }

        const data = await response.json();

        if (data.error) {
            return { success: false, error: data.error, servers: [] };
        }

        const result = { success: true, servers: data.servers };
        cache.set(cacheKey, { data: result, timestamp: currentTime });

        return result;
    } catch (error) {
        return { success: false, error: error.message, servers: [] };
    }
}

module.exports = getOnlineMembers;
