const refreshMinecraftToken = require('./../modules/authentication/tokens/refreshMinecraftToken')
module.exports = (fastify, opts, done) => {
    fastify.get('/getXboxToken', async (req, reply) => {
        try {
          
            const { guildID } = req.query;
            const token = await refreshMinecraftToken('1259421452529172512', fastify.db);
            console.log(token)
            reply.send({ success: true, token });


        } catch (err) {
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
