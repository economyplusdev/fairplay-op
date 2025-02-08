const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function getNotifications(db, guildID) {
    const PocketRealm = await refreshRealmToken(guildID, db);
    const requestData = {
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Authorization": PocketRealm.token,
            "Charset": "utf-8",
            "Client-Ref": "6f41185336adb065d5f82578308b6e3bc3cfb9e7",
            "Client-Version": "1.21.51",
            "Content-Type": "application/json",
            "User-Agent": "MCPE/UWP",
            "X-ClientPlatform": "Windows",
            "X-NetworkProtocolVersion": "766",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            "Host": "pocket.realms.minecraft.net",
            "Connection": "Keep-Alive",
        },
    };

    const response = await fetch("https://pocket.realms.minecraft.net/invites/all", requestData);
    if (!response.ok) {
        return { success: false, status: response.status, statusText: response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
}

module.exports = getNotifications;
