const translations = [
    { text: 'fairplay.newEvent.creatingClient', message: "Allocating new Server", success: false },
    { text: 'fairplay.newEvent.InvalidUsage', message: "Invalid usage. Please provide a realm ID.", success: false },
    { text: 'fairplay.newEvent.findingServer', message: "Finding the server for the realm...", success: false },
    { text: 'fairplay.newEvent.ConnectionFailed', message: "Connection failed.", success: false },
    { text: 'fairplay.newEvent.foundServer', message: "Server found!", success: false },
    { text: 'fairplay.newEvent.connecting', message: "Connecting to the server...", success: false },
    { text: 'fairplay.newEvent.connected', message: "Successfully connected to the server.", success: true },
    { text: 'fairplay.newEvent.SpawnFailed', message: "Failed to spawn the player.", success: false },
    { text: 'fairplay.newEvent.PacketReadError', message: "Error reading packet.", success: false },
    { text: 'fairplay.newEvent.SpawnSuccess', message: "Player spawned successfully.", success: true }
];

function getTranslation(text) {
    return translations.find(t => t.text === text);
}

module.exports = getTranslation;
