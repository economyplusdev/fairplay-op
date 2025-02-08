const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../../../config.json');

const tr = require('../../../../modules/helpers/cloudflare/translateText');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

module.exports = (fastify, opts, done) => {
    fastify.post('/api/embeds/sendConnectionEmbed/:id', async (req, reply) => {
        try {
            if (req.headers.authorization !== process.env.BACKEND_SECRET) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const serverID = req.params.id
            const realmID = req.query.realmID
            const isConnected = req.body.isConnected

            const channels = await fastify.db.mongoFindOne(`realmLogging_${realmID}`, { guildID: serverID })

            if (!channels) return reply.status(404).send({ success: false, error: 'No channels found' })

            const realmChatChannel = channels.allChannels.find(c => c.type === 'botConnection')
            if (!realmChatChannel) return reply.status(404).send({ success: false, error: 'No realm chat channel found' })

            const channel = await fastify.discordClient.channels.fetch(realmChatChannel.channelID)
            if (!channel) return reply.status(404).send({ success: false, error: 'Channel not found' })

            const realmList = await getRealmList(serverID, fastify.db)
            const realm = realmList.realms.find(r => parseInt(r.id) === parseInt(realmID))

            const realmPicture = realm?.clubPicture

            const languageData = await fastify.db.mongoFindOne(`lang_${serverID}`, { guildID: serverID })
            const locale = languageData?.locale || 'en'

            const emoji = findEmoji(req.discordClient.guilds.cache.get(serverID), realmID)

            const embed = new EmbedBuilder()

            if (isConnected) {
                embed.setTitle(await tr('Connected to realm', locale))
                embed.setThumbnail(realmPicture)
                embed.setColor(colors.success)
                embed.setDescription(`${emojis.reply} ${await tr('Realm Name:', locale)} **${stripFormatting(realm.name)}**\n${emojis.end} ${await tr('Fairplay has **connected** to this Realm', locale)} ${emoji}`)
                return await channel.send({ embeds: [embed] })
            } else {
                embed.setTitle(await tr('Disconnected from realm', locale))
                embed.setThumbnail(realmPicture)
                embed.setColor(colors.error)
                embed.setDescription(`${emojis.reply} ${await tr('Realm Name:', locale)} **${stripFormatting(realm.name)}**\n${emojis.end} ${await tr('Fairplay has **disconnected** to this Realm', locale)} ${emoji}`)
                return await channel.send({ embeds: [embed] })
            }

        } catch (error) {
            console.log(error)
        }


    })
    done()
}
