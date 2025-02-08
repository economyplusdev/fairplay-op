const fetch = require('node-fetch');
const uploadimage = require('../cloudflare/uploadImage');
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getClubInfo(clubID, token) {
    const key = `${clubID}_${token}`;
    const now = Date.now();
    if (cache.has(key)) {
        const cached = cache.get(key);
        if (now - cached.timestamp < CACHE_DURATION) return cached.data;
    }
    try {
        const auth = { 'x-xbl-contract-version': '2', 'Authorization': token, 'Accept-Language': "en-US" };
        const res = await fetch(`https://clubhub.xboxlive.com/clubs/Ids(${clubID || 0})/decoration/clubpresence`, { headers: auth });
        if (!res.ok) throw new Error(`Xbox API responded with status ${res.status}`);
        const club = await res.json();
        const imageUrl = club.clubs?.[0]?.displayImageUrl;
        if (!imageUrl) throw new Error('Invalid club data');
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error(`Failed to fetch image from ${imageUrl}`);
        const imageData = await imageRes.buffer();
        const clubpicture = await uploadimage(imageData, `${clubID}.png`);
        cache.set(key, { data: clubpicture, timestamp: now });
        return clubpicture;
    } catch (error) {
        console.error(`Error fetching club info for clubID ${clubID}:`, error);
        return 'https://panel.economyplus.solutions/cdn/83ea5ece02377601e7e1.png';
    }
}

module.exports = getClubInfo;
