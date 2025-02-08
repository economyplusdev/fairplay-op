const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function getRealmStories(realmID, guildID, db) {
    const PocketRealm = await refreshRealmToken(guildID, db);
    const requestData = {
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Authorization": PocketRealm.token,
            "charset": "utf-8",
            "client-ref": "6f41185336adb065d5f82578308b6e3bc3cfb9e7",
            "client-version": "1.21.51",
            "content-type": "application/json",
            "user-agent": "MCPE/UWP",
            "x-clientplatform": "Windows",
            "x-networkprotocolversion": "766",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            "Host": "frontend.realms.minecraft-services.net",
            "Connection": "Keep-Alive"
        }
    };

    const response = await fetch(`https://frontend.realms.minecraft-services.net/api/v1.0/worlds/${realmID}/stories`, requestData);
    if (!response.ok) {
        console.log(response);
        return { success: false, error: `Error: ${response.statusText}` };
    }

    const realmData = await response.json();
    return { success: true, realmData };
}

module.exports = getRealmStories;
