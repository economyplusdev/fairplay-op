const translateXboxAuthentication = require('../../../modules/authentication/xbox/translateXboxAuthentication');
const findXboxSession = require('../../../modules/authentication/xbox/findXboxSession');
const linkXboxToDiscord = require('../../../modules/authentication/xbox/linkXboxToDiscord');

const cache = new Map();

module.exports = function (fastify, opts, done) {
    fastify.get('/api/xbox/callBack', async (req, reply) => {
       try {
        const code = req.query.code;
        const cookie = req.cookies.xboxSessions

        if(!code || !cookie) return reply.status(400).send({ success: false, error: "Missing code or cookie" });

        const session = cache.get(code);
        if (session) return reply.status(400).send({ success: false, error: 'Invalid state[This state has already been validated]' });

        const translationResponse = await translateXboxAuthentication(code);
        
        const sessionData = await findXboxSession(cookie, fastify.db);
        const guildID = sessionData.guildID;

        await linkXboxToDiscord(guildID, translationResponse, fastify.db);

        cache.set(code, 'completed');

        reply.redirect(`http://localhost:1113/dashboard/${guildID}`);
        
        } catch (error) {
            reply.status(500).send({ success: false, error: error.message });
        }
    });

    done();
};
