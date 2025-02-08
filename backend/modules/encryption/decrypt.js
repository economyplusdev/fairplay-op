const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

function decrypt(encryptedData) {
    if(encryptedData?.iv == undefined || encryptedData?.data == undefined) return console.log('Error: Missing iv or data')

    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Convert hex key to buffer
    const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, iv);
    let decrypted = decipher.update(encryptedData.data, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return JSON.parse(decrypted);
}

module.exports = decrypt;
