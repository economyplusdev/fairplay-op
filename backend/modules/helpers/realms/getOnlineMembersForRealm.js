const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function getOnlineMembersForRealm(realmID, guildID, db) {
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

    try {
        const response = await fetch(`https://pocket.realms.minecraft.net/activities/live/players`, requestData);
        if (!response.ok) {
            return { success: false, error: `Error: ${response.statusText}` };
        }

        const liveData = await response.json();

        const server = liveData.servers.find(s => s.id === Number(realmID));
        if (!server) {
            return { success: false, error: `Realm with ID ${realmID} not found.` };
        }

        return { success: true, onlinePlayers: server.players };
    } catch (error) {
        return { success: false, error: `Exception: ${error.message}` };
    }
}

module.exports = getOnlineMembersForRealm;
