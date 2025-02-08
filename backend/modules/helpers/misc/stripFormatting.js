function stripFormatting(text) {
    return text.replace(/§./g, '');
}

module.exports = stripFormatting;
