const { colors } = require('../../../config.json');

function determineEmbedColor(status, predefinedColors) {
    if (!predefinedColors) predefinedColors = { error: colors.error, success: colors.success, warning: colors.warning };

    const hasErrors = status.some(s => !s.success);
    const hasSuccesses = status.some(s => s.success);

    if (hasErrors && hasSuccesses) return predefinedColors.warning;
    if (hasErrors) return predefinedColors.error;
    return predefinedColors.success;
}

module.exports = determineEmbedColor;
