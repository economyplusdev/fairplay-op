const findSession = require('../../../modules/authentication/findSession')
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer')

module.exports = (fastify, opts, done) => {
  fastify.get('/api/dashboard/getSavedRoles/:id', async (req, reply) => {

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

    const serverData = await fastify.db.mongoFindOne('discordDataRoles', { guildID: serverID })
    if (!serverData) return reply.status(200).send({ success: true, roles: [] }) 


    reply.send({ success: true, roles: serverData })

  })
  done()
}
