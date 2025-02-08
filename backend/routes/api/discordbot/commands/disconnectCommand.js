const { emojis, colors } = require('../../../../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const backendSecret = process.env.BACKEND_SECRET;

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');

const tr = require('../../../../modules/helpers/cloudflare/translateText');

module.exports = (fastify, opts, done) => {
    fastify.post('/api/discordbot/disconnectCommand', async (req, reply) => {
        try {
            if (req.headers.authorization !== backendSecret) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const { guildID } = req.query;
            const { locale } = req.body;

            if (!(await isServerSetup(guildID, fastify.db))) {
                return reply.status(200).send({
                    error: 'Server is not setup',
                    interaction: await serverNotSetup(locale, guildID),
                    success: false
                });
            }

            await fastify.db.mongoDeleteOne('discordDataLogging', { guildID: guildID });
            await fastify.db.mongoDeleteOne('discordDataRoles', { guildID: guildID });
            await fastify.db.mongoDeleteOne('xboxData', { guildID: guildID });

            const successEmbed = new EmbedBuilder()
                .setTitle(await tr('Success', locale))
                .setDescription(await tr('Your realm(s) have been disconnected from fairplay+', locale))
                .setColor(colors.success);

            return reply.status(200).send({
                interaction: {
                    embeds: [successEmbed],
                    buttons: []
                },
                success: true
            });
            
            


        } catch (error) {

        }

    });

    done();
};
