const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function getOnlinePlayers(realmID, db, guildID) {
    const PocketRealm = await refreshRealmToken(guildID, db);
    const requestData = {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            "Charset": "utf-8",
            "Client-Version": "1.18.2",
            "User-Agent": "MCPE/UWP",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            "Host": "pocket.realms.minecraft.net",
            "Authorization": PocketRealm.token,
        },
    };

    const response = await fetch(`https://pocket.realms.minecraft.net/activities/live/players`, requestData);
    if (!response.ok) {
        return { success: false, error: `HTTP error! Status: ${response.status}` };
    }

    const data = await response.json();
    const realmPlayers = data.servers.find(server => server.id === realmID);

    if (!realmPlayers) {
        return { success: false, error: "Realm not found in the list of active servers." };
    }

    return { success: true, players: realmPlayers.players };
}

module.exports = getOnlinePlayers;
