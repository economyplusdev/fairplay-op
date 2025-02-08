const decrypt = require('../../encryption/decrypt');

async function findXboxData(guildID, db) {

    const sessionData = await db.mongoFindOne('xboxData', { guildID: guildID });

    if (!sessionData) return false;

    const decryptedData = await decrypt({ iv: sessionData.iv, data: sessionData.data });

    return decryptedData;

}

module.exports = findXboxData;
