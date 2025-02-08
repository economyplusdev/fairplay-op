const findSession = require('../../../modules/authentication/findSession')
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer')

module.exports = (fastify, opts, done) => {
  fastify.get('/api/discord/getRoles/:id', async (req, reply) => {
    try {
      const serverID = req.params.id
      const cookie = req.cookies.session
      if (!cookie) {
        return reply.status(401).send({ success: false, error: 'No session cookie found' })
      }

      const sessionData = await findSession(cookie, fastify.db)
      if (!sessionData) {
        return reply.status(401).send({ success: false, error: 'Invalid session cookie' })
      }

      const guilds = sessionData.guilds.filter(g => g.owner || (g.permissions & 0x8))
      const isOwner = await doesUserOwnDiscordServer(serverID, guilds)
      if (!isOwner) {
        return reply.status(401).send({ success: false, error: 'You do not own this server' })
      }

      const isSetup = await isServerSetup(serverID, fastify.db)
      if (!isSetup) {
        return reply.status(402).send({ success: false, error: 'Server is not setup' })
      }

      const guild = req.discordClient.guilds.cache.get(serverID)
      if (!guild) {
        return reply.status(404).send({ success: false, error: 'Guild not found or bot not in guild' })
      }

      const roles = guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(r => ({
          id: r.id,
          name: r.name,
          color: r.color
        }))

      reply.send({ success: true, roles })
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message })
    }
  })

  done()
}
