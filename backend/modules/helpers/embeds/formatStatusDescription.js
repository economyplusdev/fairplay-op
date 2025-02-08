const { emojis } = require('../../../config.json');
/**
 * Formats the status array into a Discord embed description.
 * @param {Array} status - Array of status objects containing text and success keys.
 * @returns {string} - Formatted description string for Discord embeds.
 */
function formatStatusDescription(status) {
    return status
        .map((s, i) => `${i === status.length - 1 ? emojis.end : emojis.reply} ${s.text}`)
        .join('\n');
}

module.exports = formatStatusDescription;
