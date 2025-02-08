const fetch = require("node-fetch");
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken");

async function inviteUser(realmID, xuid, db, guildID) {
    const PocketRealm = await refreshRealmToken(guildID, db);
    const requestData = {
        method: "put",
        headers: {
            "Cache-Control": "no-cache",
            Charset: "utf-8",
            "Client-Version": "1.17.41",
            "User-Agent": "MCPE/UWP",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            Host: "pocket.realms.minecraft.net",
            Authorization: PocketRealm.token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            invites: {
                [xuid]: "ADD"
            }
        })
    };

    const response = await fetch(`https://pocket.realms.minecraft.net/invites/${realmID}/invite/update`, requestData);
    if (!response.ok) {
        return { success: false };
    }
    return { success: true };
}

module.exports = inviteUser;
