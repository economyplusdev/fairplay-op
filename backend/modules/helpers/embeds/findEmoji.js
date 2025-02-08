/**
 * Finds and formats a Discord emoji for a given realmID.
 * @param {Object} guild - The Discord guild object.
 * @param {number|string} realmID - The ID of the realm.
 * @returns {string} - Formatted emoji string.
 * @throws {Error} - Throws an error if the emoji is not found.
 */
function findEmoji(guild, realmID) {
    if (!guild || !realmID) {
        console.error('Guild or realmID not provided.');
    }

    const emojiName = `realm_${realmID}`;
    const emoji = guild.emojis.cache.find(e => e.name === emojiName);

    if (!emoji) {
        return `❓`;
    }

    return `<:${emoji.name}:${emoji.id}>`;
}

module.exports = findEmoji;
