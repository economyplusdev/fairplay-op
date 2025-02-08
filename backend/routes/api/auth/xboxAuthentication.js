const createNewXboxSession = require('../../../modules/authentication/xbox/createNewXboxSession');
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer');
const findSession = require('../../../modules/authentication/findSession');
const { live } = require('@xboxreplay/xboxlive-auth');

const clientID = process.env.XBOXCLIENTID;
const redirect = process.env.XBOXREDIRECT;

module.exports = function (fastify, opts, done) {
    fastify.get('/api/create/xbox', async (req, reply) => {
        try {
            const guildID = req.query.guildID;

            if (!guildID || typeof guildID !== 'string') {
                return reply.status(400).send({ success: false, error: 'Invalid or missing guild ID' });
            }

            const cookie = req.cookies.session;
            if (!cookie) {
                return reply.status(401).send({ success: false, error: 'No session cookie found' });
            }

            const sessionData = await findSession(cookie, fastify.db);
            if (!sessionData) {
                return reply.status(401).send({ success: false, error: 'Invalid session cookie' });
            }

            const guilds = sessionData.guilds.filter(g => g.owner || (g.permissions & 0x8));
            const isOwner = await doesUserOwnDiscordServer(guildID, guilds);
            if (!isOwner) {
                return reply.status(401).send({ success: false, error: 'You do not own this server' });
            }

            const randomState = await createNewXboxSession(guildID, fastify.db);

            reply.setCookie('xboxSessions', randomState, {
                domain: '.localhost',
                path: '/',
                maxAge: 300 * 24 * 60 * 60,
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });

            const authorizeUrl = live.getAuthorizeUrl(clientID, 'XboxLive.signin XboxLive.offline_access', 'code', redirect);
            reply.redirect(authorizeUrl);

        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
