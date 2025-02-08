const findSession = require('../../../modules/authentication/findSession')
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer')
const { ChannelType } = require('discord.js')

module.exports = (fastify, opts, done) => {
  fastify.get('/api/discord/getChannels/:id', async (req, reply) => {
    try {
      const serverID = req.params.id
      const cookie = req.cookies.session
      if (!cookie) return reply.status(401).send({ success: false, error: 'No session cookie found' })
      const sessionData = await findSession(cookie, fastify.db)
      if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' })
      const guilds = sessionData.guilds.filter(g => g.owner || (g.permissions & 0x8))
      const isOwner = await doesUserOwnDiscordServer(serverID, guilds)
      if (!isOwner) return reply.status(401).send({ success: false, error: 'You do not own this server' })
      const isSetup = await isServerSetup(serverID, fastify.db)
      if (!isSetup) return reply.status(402).send({ success: false, error: 'Server is not setup' })

      const guild = req.discordClient.guilds.cache.get(serverID)
      if (!guild) return reply.status(404).send({ success: false, error: 'Guild not found or bot not in guild' })

      const channels = guild.channels.cache
        .filter(ch => [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(ch.type))
        .map(ch => ({
          id: ch.id,
          name: ch.name,
          type: ch.type === ChannelType.GuildText ? 'text' : 'announcement'
        }))

      reply.send({ success: true, channels })
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message })
    }
  })
  done()
}
