const decrypt = require('../../encryption/decrypt');

async function findXboxSession(cookieID, db) {
   
    const sessionData = await db.mongoFindOne('xboxSessions', {cookieID: cookieID});
    
    if(!sessionData) return false;
    
    const decryptedData = await decrypt({iv: sessionData.iv, data: sessionData.data});
    
    return decryptedData;

}

module.exports = findXboxSession;
