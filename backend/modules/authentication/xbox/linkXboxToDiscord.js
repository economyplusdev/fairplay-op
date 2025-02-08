const encrypt = require('../../encryption/encrypt');

async function linkXboxToDiscord(guildID, userData, db){
    
    const sessionData = {
        guildID: guildID,
        userInfo: userData
    };

    const encryptedData = await encrypt(sessionData);

    await db.mongoInsertOne('xboxData', {
        guildID: guildID,
        iv: encryptedData.iv,
        data: encryptedData.data
    });

    return true;

}

module.exports = linkXboxToDiscord;