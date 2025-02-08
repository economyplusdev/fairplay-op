const fetch = require('node-fetch')
const normalizeLanguage = require('./normalizeLanguage')

const GATEWAYENDPOINT = process.env.GATEWAYENDPOINT
const CLOUDFLAREAI = process.env.CLOUDFLAREAI

async function tr(text, toTranslateTo) {
    const targetLang = normalizeLanguage[toTranslateTo]
    if (!targetLang) return text

    if (targetLang === 'en') return text

    const response = await fetch(`${GATEWAYENDPOINT}/@cf/meta/m2m100-1.2b`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLAREAI}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            source_lang: "english",
            target_lang: targetLang
        })
    })

    const data = await response.json()
    return data.result.translated_text || text
}

module.exports = tr
