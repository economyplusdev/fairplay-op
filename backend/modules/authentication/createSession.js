const crypto = require('crypto');
const encrypt = require('../encryption/encrypt');

async function createNewSession(redirect, db) {
    const randomID = crypto.randomBytes(16).toString('hex');

    const sessionData = {
        cookieID: randomID,
        redirect: redirect,
        guilds: [],
        userInfo: {
            username: "",
            pfp: "",
            id: ""
        }
    };

    const encryptedData = await encrypt(sessionData);

    await db.mongoInsertOne('sessions', {
        cookieID: randomID,
        iv: encryptedData.iv,
        data: encryptedData.data
    });

    return randomID;
}

module.exports = createNewSession;
