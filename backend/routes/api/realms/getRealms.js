const findSession = require('../../../modules/authentication/findSession');
const isServerSetup = require('../../../modules/database/operations/isServerSetup');
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer');

const getRealmList = require('../../../modules/helpers/realms/getRealmList');

module.exports = (fastify, opts, done) => {
    fastify.get('/api/realms/getRealmList/:id', async (req, reply) => {
        try {
            const serverID = req.params.id;

            const cookie = req.cookies.session;
            if (!cookie) return reply.status(401).send({ success: false, error: 'No session cookie found' });

            const sessionData = await findSession(cookie, fastify.db);
            if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' });

            const guilds = await Promise.all(
                sessionData.guilds
                    .filter(g => g.owner || (g.permissions & 0x8))
            );

            const isOwner = await doesUserOwnDiscordServer(serverID, guilds);
            if (!isOwner) return reply.status(401).send({ success: false, error: 'You do not own this server' });

            const isSetup = await isServerSetup(serverID, fastify.db);
            if (!isSetup) return reply.status(402).send({ success: false, error: 'Server is not setup' });

            const realms = await getRealmList(serverID, fastify.db);
            return reply.send(realms);

        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
