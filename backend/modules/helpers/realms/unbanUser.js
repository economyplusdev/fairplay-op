const fetch = require("node-fetch")
const refreshRealmToken = require("../../authentication/tokens/refreshRealmToken")

async function unbanUser(realmID, xuid, db, guildID) {
    const PocketRealm = await refreshRealmToken(guildID, db)
    const requestData = {
        method: "delete",
        headers: {
            "Cache-Control": "no-cache",
            Charset: "utf-8",
            "Client-Version": "1.17.41",
            "User-Agent": "MCPE/UWP",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            Host: "pocket.realms.minecraft.net",
            Authorization: PocketRealm.token,
        }
    }
    const response = await fetch(`https://pocket.realms.minecraft.net/worlds/${realmID}/blocklist/${xuid}`, requestData)
    if (!response.ok) {
        return { success: false }
    }
    return { success: true }
}

module.exports = unbanUser
