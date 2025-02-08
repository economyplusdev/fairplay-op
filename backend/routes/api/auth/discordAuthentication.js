const createNewSession = require('../../../modules/authentication/createSession');

const discordclientID = process.env.clientID;
const discordRedirect = process.env.discordRedirect;
module.exports = function (fastify, opts, done) {
    fastify.get('/api/discord/create', async (req, reply) => {
        try {
            const redirect = req.query.redirect || 'https://economyplus.solutions/dashboard';

            const randomstate = await createNewSession(redirect, fastify.db);

            let scopes = ["identify", "role_connections.write", "guilds"];
            const authorizationUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordclientID}&redirect_uri=${encodeURIComponent(
                discordRedirect
            )}&response_type=code&scope=${encodeURIComponent(
                scopes.join(" ")
            )}&state=${randomstate}`;
            
            reply.redirect(authorizationUrl);

        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
