const { emojis } = require('../../../../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const backendSecret = process.env.BACKEND_SECRET;

const isServerSetup = require('../../../../modules/database/operations/isServerSetup');
const serverNotSetup = require('../../../../modules/replies/generic/serverNotSetup');
const getRealmList = require('../../../../modules/helpers/realms/getRealmList');
const tr = require('../../../../modules/helpers/cloudflare/translateText');
const formatStatusDescription = require('../../../../modules/helpers/embeds/formatStatusDescription');
const determineEmbedColor = require('../../../../modules/helpers/embeds/determineEmbedColor');
const findEmoji = require('../../../../modules/helpers/embeds/findEmoji');

const stripFormatting = require('../../../../modules/helpers/misc/stripFormatting');

const registerCommandList = require('../../../../modules/helpers/discord/commandList');

module.exports = (fastify, opts, done) => {
    fastify.post('/api/discordbot/connectCommand', async (req, reply) => {
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

            const realmList = await getRealmList(guildID, fastify.db);
            const guild = req.discordClient.guilds.cache.get(guildID);

            let status = [];

            await Promise.all(
                realmList.realms.map(async (realm) => {
                    const existingEmoji = findEmoji(guild, realm.id);
                    if (existingEmoji === '❓') {
                        try {
                            const emoji = await guild.emojis.create({
                                attachment: realm.clubPicture,
                                name: `realm_${realm.id}`
                            });
                            status.push({
                                text: `${await tr('Connected to', locale)} **${stripFormatting(realm.name)}** <:${emoji.name}:${emoji.id}>`,
                                success: true
                            });
                        } catch (error) {
                            status.push({
                                text: `${await tr('Error uploading emoji for realm', locale)} **${stripFormatting(realm.name)}** ${await tr(error.message, locale)} ${emojis.error}`,
                                success: false
                            });
                        }
                    } else {
                        status.push({
                            text: `${await tr('Connected to', locale)} **${stripFormatting(realm.name)}** ${existingEmoji}`,
                            success: true
                        });
                    }
                })
            );

            const description = formatStatusDescription(status);

            const embedColor = determineEmbedColor(status);

            const discordCommandStatus = await registerCommandList(guildID);

            const embed = new EmbedBuilder()
                .setTitle(await tr('Fairplay Setup', locale))
                .setDescription(description)
                .setColor(embedColor);

            const dashboardLogs = new ButtonBuilder()
                .setLabel(await tr('Logs', locale))
                .setURL(`http://localhost:1113/dashboard/${guildID}/logs`)
                .setStyle(ButtonStyle.Link);

            const dashboardPermissions = new ButtonBuilder()
                .setLabel(await tr('Permissions', locale))
                .setURL(`http://localhost:1113/dashboard/${guildID}/permissions`)
                .setStyle(ButtonStyle.Link);

            const actionRow = new ActionRowBuilder().addComponents(dashboardLogs, dashboardPermissions);

            const languageData = await fastify.db.mongoFindOne(`lang_${guildID}`, { guildID: guildID })
            if (!languageData) {
              await fastify.db.mongoInsertOne(`lang_${guildID}`, { guildID: guildID, locale: locale })
            } else {
              await fastify.db.mongoUpdateOne(`lang_${guildID}`, { guildID: guildID }, { $set: { locale: locale } })
            }

            return reply.status(200).send({
                interaction: { embeds: [embed], buttons: [actionRow] },
                success: true
            });
        } catch (err) {
            console.error(err);
            reply.status(500).send({ error: 'Internal server error' });
        }
    });

    done();
};