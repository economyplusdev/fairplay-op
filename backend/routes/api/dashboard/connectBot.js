const findSession = require('../../../modules/authentication/findSession')
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer')

const createNewConnection = require('../../../modules/helpers/realms/gopher/createConnection');

module.exports = (fastify, opts, done) => {
  fastify.get('/api/dashboard/connectToRealm/:id', async (req, reply) => {

    const guildID = req.params.id
    const realmID = req.query.realmID

    const cookie = req.cookies.session
    if (!cookie) return reply.status(401).send({ success: false, error: 'No session cookie found' })
    const sessionData = await findSession(cookie, fastify.db)
    if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' })
    const guilds = sessionData.guilds.filter(g => g.owner || (g.permissions & 0x8))
    const isOwner = await doesUserOwnDiscordServer(guildID, guilds)
    if (!isOwner) return reply.status(401).send({ success: false, error: 'You do not own this server' })
    const isSetup = await isServerSetup(guildID, fastify.db)
    if (!isSetup) return reply.status(402).send({ success: false, error: 'Server is not setup' })


    const connectionResult = await createNewConnection(realmID, guildID);


    reply.send({ success: connectionResult.success })

  })
  done()
}
