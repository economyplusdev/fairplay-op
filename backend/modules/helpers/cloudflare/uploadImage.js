const fetch = require('node-fetch');
const SDK = require('aws-sdk/clients/s3');
require('dotenv').config();
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const cloudflareEndPoint = process.env.CLOUDFLARENDPOINT;
const accessKeyId = process.env.CLOUDFLAREACCESSID;
const secretAccessKey = process.env.CLOUDFLARESECRETID;

const s3 = new SDK({
    endpoint: cloudflareEndPoint,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    signatureVersion: 'v4',
});

async function uploadimage(imageData, name) {
    try {
        const sanitizedName = name.replace(/\s+/g, '');

        const url = await s3.getSignedUrlPromise('putObject', { 
            Bucket: 'fairplay-cdn', 
            Key: sanitizedName, 
            Expires: 3600 
        });

        const response = await fetch(url, {
            method: 'PUT',
            body: imageData,
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': imageData.length,
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to upload image. Status: ${response.status}`);
        }

        return `https://cdn.economyplus.solutions/${sanitizedName}?ix=${Date.now()}&iv=1`;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = uploadimage;
