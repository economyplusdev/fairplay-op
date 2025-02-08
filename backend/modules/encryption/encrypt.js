const crypto = require('crypto');

const dotenv = require('dotenv');
dotenv.config();

async function encrypt(data) {
    const iv = crypto.randomBytes(16);
    const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return {
        iv: iv.toString('hex'),
        data: encrypted
    };
}
module.exports = encrypt;