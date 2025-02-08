const fetch = require("node-fetch")

async function createNewConnection(realmID, guildID) {
    const requestData = {
        method: "get",
        headers: {
            "Cache-Control": "no-cache",
        }
    }
    const response = await fetch(`http://localhost:4444/api/connectClient/${guildID}?realmID=${realmID}`, requestData)
    if (!response.ok) {
        return { success: false }
    }
    return { success: true, message: "fairplay.newEvent.creatingClient" }
}

module.exports = createNewConnection
