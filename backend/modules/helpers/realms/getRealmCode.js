const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function getRealmCode(realmID, guildID, db) {
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

    const response = await fetch(`https://pocket.realms.minecraft.net/links/v1?worldId=${realmID}`, requestData);
    if (!response.ok) {
        return { success: false, error: `Error: ${response.statusText}` };
    }

    const realmData = await response.json();
    return { success: true, realmData };
}

module.exports = getRealmCode;
