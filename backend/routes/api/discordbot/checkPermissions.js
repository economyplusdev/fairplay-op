const backendSecret = process.env.BACKEND_SECRET;

const noPermissionsEmbed = require('../../../modules/replies/generic/noPermisions');

const commandMap = [
    { role: 'connect', commands: ['connect'] },
    { role: 'disconnect', commands: ['disconnect'] },
    { role: 'ban/unban', commands: ['realm-ban', 'realm-unban'] },
    { role: 'close/open', commands: ['realm-close', 'realm-open'] },
    { role: 'backup', commands: ['realm-backup'] },
    { role: 'players', commands: ['realm-players'] },
    { role: 'realmCode', commands: ['realm-code'] },
    { role: 'realmJoin', commands: ['realm-join'] },
]

module.exports = (fastify, opts, done) => {
    fastify.post('/api/discordbot/checkPermissions/:id', async (req, reply) => {
        try {

            if (req.headers.authorization !== backendSecret) return reply.status(401).send({ error: 'Unauthorized' });

            const guildID = req.params.id;
            const userRoles = req.body.roles;
            const userHasAdminstator = req.body.hasAdminstator;
            const commandName = req.body.commandName;
            const locale = req.body.locale;

            const serverRoles = await fastify.db.mongoFindOne('discordDataRoles', { guildID });

            const serverRolesData = serverRoles?.rolesPermissions || [];
            const commandMapping = commandMap.find(map => map.commands.includes(commandName));
            if (!commandMapping) return reply.status(200).send({ error: 'Invalid command name', interaction: await noPermissionsEmbed([], locale), hasPermission: false });

            const commandRole = commandMapping.role;
            const rolePermission = serverRolesData.find(role => role.role === commandRole);

            const rolesAllowed = rolePermission?.roles || [];
            const hasPermission = userHasAdminstator || userRoles.some(userRole => rolesAllowed.includes(userRole));

            if (!hasPermission) return reply.status(200).send({ error: 'Insufficient permissions', interaction: await noPermissionsEmbed(rolesAllowed, locale), hasPermission: false });

            reply.send({ hasPermission });
        } catch (err) {
            console.error(err);
            reply.status(500).send({ error: 'Internal server error' });
        }
    });

    done();
};
