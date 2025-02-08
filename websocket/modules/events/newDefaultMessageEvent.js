const sendTextEmbed = require('../embed/sendTextEmbed');

async function newDefaultMessageEvent(event, { realmID, discordID }, fastify) {
    const textType = event.TextType;

    if(textType == 1){
        let message = event.Message;
        const { SourceName, XUID } = event;
        message = message.replace(/[^\x00-\x7F]/g, "");

        if(SourceName.length > 0 && XUID.length > 0){

            fastify.textPackets.inc();

            const payLoad = `**<${SourceName}>** ${message}`;
            const status = await sendTextEmbed(payLoad, realmID, discordID);
            console.log(`[Fairplay.NewEvent.DefaultMessageEvent] ${SourceName}: ${JSON.stringify(status)}`);
            return true;
        }
    }

    fastify.tellrawPackets.inc();



}

module.exports = newDefaultMessageEvent;