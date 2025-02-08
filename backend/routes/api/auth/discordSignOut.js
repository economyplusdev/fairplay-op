const findSession = require('../../../modules/authentication/findSession');

module.exports = function (fastify, opts, done) {
    fastify.get('/api/discord/signOut', async (req, reply) => {
        try {
            
            const session = req.cookies.session;
            const redirect = req.query.redirect || '/';

            if (!session) return reply.status(401).send({ success: false, error: 'No session cookie found' });

            const sessionData = await findSession(session, fastify.db);

            if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' });

            await fastify.db.mongoDeleteOne('sessions', { cookieID: session });

            reply.clearCookie('session')
            reply.redirect(redirect)

        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
