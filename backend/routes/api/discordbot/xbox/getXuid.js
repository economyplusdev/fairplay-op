const backendSecret = process.env.BACKEND_SECRET;

const getUserXUID = require('../../../../modules/helpers/xbox/getUserXUID');
const invalidUsername = require('../../../../modules/replies/generic/invalidUsername');

module.exports = (fastify, opts, done) => {
    fastify.post('/api/discordbot/xbox/getUserInfo/:id', async (req, reply) => {

        const guildID = req.params.id;
        const locale = req.body.locale;
        const username = req.body.username;

        if (req.headers.authorization !== backendSecret) return reply.status(401).send({ error: 'Unauthorized' });

        const userXUID = await getUserXUID(username, guildID, fastify.db);

        if (userXUID.error) return reply.status(500).send({ error: userXUID.error, success: false, interaction: await invalidUsername(locale) });
        return reply.send({ xuid: userXUID.data });

    });

    done();
};
