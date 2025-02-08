const getRealmAddress = require('../../../modules/helpers/realms/getRealmAddress');
const getRawRealmList = require('../../../modules/helpers/realms/getRawRealmList');

const refreshXboxToken = require('../../../modules/authentication/tokens/refreshXboxToken');
const inviteUser = require('../../../modules/helpers/realms/inviteUser');
const getNotifications = require('../../../modules/helpers/realms/getNotifications');
const acceptInvite = require('../../../modules/helpers/realms/acceptInvite');
const changePermissions = require('../../../modules/helpers/realms/changePermissionLevel');

const botAccounts = [
    '1332381672305332296'
]

module.exports = (fastify, opts, done) => {
    fastify.get('/api/realms/getRealmIP/:id', async (req, reply) => {
        try {
            const serverID = req.params.id;
            const realmID = req.query.realmID;

            const randomBotAccount = botAccounts[Math.floor(Math.random() * botAccounts.length)];

            const realmList = await getRawRealmList(randomBotAccount, fastify.db);

            const isInsideRealm = realmList.realmData.servers.find(realm => realm.id === parseInt(realmID));

            const accountInfo = await refreshXboxToken(randomBotAccount, fastify.db);
            const accountXUID = accountInfo.ownerUUID;

            if (!isInsideRealm) {
                const invite = await inviteUser(realmID, accountXUID, fastify.db, serverID);
                if (!invite.success) return reply.status(500).send({ success: false, error: 'Failed to invite bot account to realm' });

                const notifications = await getNotifications(fastify.db, randomBotAccount);
                if (!notifications.success) return reply.status(500).send({ success: false, error: 'Failed to get bot account notifications' });

                const invitationID = notifications.data.invites.find(invite => invite.worldId === realmID)?.invitationId
                if (!invitationID) return reply.status(500).send({ success: false, error: 'Failed to get realm invitation ID ?? Not a possible condition' });

                const accept = await acceptInvite(fastify.db, randomBotAccount, invitationID);
                if (!accept.success) return reply.status(500).send({ success: false, error: 'Failed to accept realm invitation' });
            }

            const permissions = await changePermissions(fastify.db, serverID, accountXUID, 'OPERATOR', realmID);
            if (!permissions.success) return reply.status(500).send({ success: false, error: 'Failed to change bot account permissions' });

            const address = await getRealmAddress(realmID, fastify.db, serverID);
            if (!address.success) return reply.status(500).send({ success: false, error: address.error });

            return reply.send(address);

        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, error: err.message });
        }
    });

    done();
};
