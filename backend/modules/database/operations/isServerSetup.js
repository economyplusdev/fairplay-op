
async function isServerSetup(guildID, db) {
    const serverData = await db.mongoFindOne('xboxData', { guildID: guildID });

    if(!serverData) return false
    
    return true
}

module.exports = isServerSetup;
