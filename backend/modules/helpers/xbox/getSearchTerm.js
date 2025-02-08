const fetch = require('node-fetch');

const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; 

const refreshXboxToken = require('../../authentication/tokens/refreshXboxToken');

async function getSearchTerm(searchValue, guildID, db) {
    const cacheKey = `${guildID}-${searchValue}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        return { searchTerm: cachedData.data, success: true, fromCache: true };
    }

    try {
        const xboxToken = await refreshXboxToken(guildID, db);

        const auth = {
            'x-xbl-contract-version': '7',
            'Authorization': xboxToken.token,
            'Accept-Language': 'en-US'
        };

        const res = await fetch(
            `https://peoplehub.xboxlive.com/users/xuid(${guildID})/people/search/decoration/detail?q=${searchValue}`,
            { headers: auth }
        );

        if (!res.ok) {
            return { error: `Xbox API responded with status ${res.status}`, success: false };
        }

        const searchTerm = await res.json();

        cache.set(cacheKey, { data: searchTerm.people, timestamp: Date.now() });

        return { data: searchTerm.people, success: true, fromCache: false };
    } catch (error) {
        return { error: error.message, success: false };
    }
}

module.exports = getSearchTerm;
