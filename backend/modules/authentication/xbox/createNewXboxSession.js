const crypto = require('crypto');
const encrypt = require('../../encryption/encrypt');

async function createNewXboxSession(guildID, db) {
    const randomID = crypto.randomBytes(16).toString('hex');

    const sessionData = {
        cookieID: randomID,
        guildID: guildID,
    };

    const encryptedData = await encrypt(sessionData);

    await db.mongoInsertOne('xboxSessions', {
        cookieID: randomID,
        iv: encryptedData.iv,
        data: encryptedData.data
    });

    return randomID;
}

module.exports = createNewXboxSession;
