const bcrypt = require('bcrypt');
const decrypt = require('../encryption/decrypt');

async function findSession(sessionID, db) {
    const session = await db.mongoFindOne('sessions', { cookieID: sessionID });
    if (!session) return null;

    const decryptedData = decrypt({ iv: session.iv, data: session.data });
    const saltRounds = 10;

    decryptedData.accessToken = await bcrypt.hash(decryptedData.accessToken, saltRounds);
    decryptedData.refreshToken = await bcrypt.hash(decryptedData.refreshToken, saltRounds);

    return decryptedData;
}

module.exports = findSession;
