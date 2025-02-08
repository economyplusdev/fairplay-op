const backendSecret = process.env.BACKEND_SECRET;

const getRealmList = require('../../../modules/helpers/realms/getRealmList');
const findEmoji = require('../../../modules/helpers/embeds/findEmoji');
const stripFormatting = require('../../../modules/helpers/misc/stripFormatting');

const pickRealm = require('../../../modules/replies/generic/pickRealm');

module.exports = (fastify, opts, done) => {
    fastify.post('/api/discordbot/askForRealms/:id', async (req, reply) => {
        const guildID = req.params.id;
        const locale = req.body.locale;

        if (req.headers.authorization !== backendSecret) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        try {
            const realmList = await getRealmList(guildID, fastify.db);
            if (!realmList || !realmList.realms) {
                return reply.status(404).send({ error: 'No realms found for this guild.' });
            }

            const guild = req.discordClient.guilds.cache.get(guildID);

            const realms = realmList.realms.map((realm) => ({
                name: stripFormatting(realm.name),
                id: realm.id,
                emoji: findEmoji(guild, realm.id),
            }));
 
            const response = await pickRealm(locale, realms);

            return reply.status(200).send({ interaction: response });


        } catch (error) {
            console.error(error);

            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    done();
};
