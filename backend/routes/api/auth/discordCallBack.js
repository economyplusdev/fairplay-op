const validateDiscordToken = require('../../../modules/authentication/discord/discord2Oauth');

const getDiscordGuilds = require('../../../modules/discord/getGuilds');
const getDiscordProfile = require('../../../modules/discord/getProfile');

const updateSession = require('../../../modules/authentication/updateSession');

const cache = new Map();

module.exports = function (fastify, opts, done) {
    fastify.get('/api/discord/callBack', async (req, reply) => {
        const code = req.query.code;
        const state = req.query.state;

        const isValidCode = /^[A-Za-z0-9]{30}$/.test(code);
        if (!isValidCode) return reply.status(400).send({ success: false, error: 'Invalid state[Validation failure]' });

        const session = cache.get(state);
        if (session) return reply.status(400).send({ success: false, error: 'Invalid state[This state has already been validated]' });

        try {
            const responseData = await validateDiscordToken(code);

            const accessToken = responseData.access_token;
            const refreshToken = responseData.refresh_token;

            const profile = await getDiscordProfile(accessToken);
            const guilds = await getDiscordGuilds(accessToken);

            const data = {
                userInfo: {
                    username: profile.username,
                    pfp: profile.avatar,
                    id: profile.id,
                },
                guilds: guilds,
                accessToken: accessToken,
                refreshToken: refreshToken,
            };

            const sessionData = await updateSession(state, data, fastify.db);

            reply.setCookie('session', state, {
                domain: '.localhost',
                path: '/',
                maxAge: 300 * 24 * 60 * 60, 
            });

            const redirect = sessionData.redirect;
            
            reply.redirect(redirect);
            cache.set(state, 'completed');
        } catch (error) {
            reply.status(500).send({ success: false, error: error.message });
        }
    });

    done();
};
