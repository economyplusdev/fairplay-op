const decrypt = require('../encryption/decrypt');
const encrypt = require('../encryption/encrypt');

async function updateSession(cookieID, data, db) {
    let previousData = await db.mongoFindOne('sessions', { cookieID: cookieID });
    const decryptedData = await decrypt(previousData);
    const updatedData = { ...decryptedData, ...data };
    const encryptedData = await encrypt(updatedData);
    await db.mongoUpdateOne('sessions', { cookieID: cookieID }, { $set: encryptedData });
    return updatedData;
}

module.exports = updateSession;
