// getRealmAddress.js
const fetch = require('node-fetch');
const refreshRealmToken = require('../../authentication/tokens/refreshRealmToken');

async function getRealmAddress(realmID, db, guildID) {
    const PocketRealm = await refreshRealmToken(guildID, db);
    const url = `https://pocket.realms.minecraft.net/worlds/${realmID}/join`;
    const requestData = {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Charset': 'utf-8',
            'Client-Version': '1.17.41',
            'User-Agent': 'MCPE/UWP',
            'Accept-Language': 'en-US',
            'Accept-Encoding': 'gzip, deflate, br',
            'Host': 'pocket.realms.minecraft.net',
            'Authorization': PocketRealm.token,
        },
    };

    for (let attempt = 1; attempt <= 10; attempt++) {
        try {
            const response = await fetch(url, requestData);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return { success: true, address: data.address };
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt < 10) {
                console.log('Retrying in 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else {
                return { success: false, error: 'Failed to retrieve realm address after 10 attempts.' };
            }
        }
    }
}

module.exports = getRealmAddress;
