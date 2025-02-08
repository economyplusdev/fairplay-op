async function doesUserOwnDiscordServer(guildID, guildList) {

    for (let i = 0; i < guildList.length; i++) {
        if (guildList[i].id === guildID) {
            return true;
        }
    }

    return false;
   
}

module.exports = doesUserOwnDiscordServer;