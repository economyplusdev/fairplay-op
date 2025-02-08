const findSession = require('../../../modules/authentication/findSession');
const isServerSetup = require('../../../modules/database/operations/isServerSetup');

module.exports = (fastify, opts, done) => {
    fastify.get('/api/discord/findProfileData', async (req, reply) => {
        try {
            const session = req.cookies.session;
            if (!session) return reply.status(401).send({ success: false, error: 'No session cookie found' });

            const sessionData = await findSession(session, fastify.db);
            if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' });

            const guilds = await Promise.all(
                sessionData.guilds
                    .filter(g => g.owner || (g.permissions & 0x8))
                    .map(async g => ({ ...g, isSetup: await isServerSetup(g.id, fastify.db) }))
            );

            reply.send({ success: true, data: { ...sessionData, guilds } });
        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
