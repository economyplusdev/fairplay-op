const findSession = require('../../../modules/authentication/findSession')
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const doesUserOwnDiscordServer = require('../../../modules/authentication/discord/doesUserOwnDiscordServer')

const getRealmStories = require('../../../modules/helpers/realms/getRealmStories')
const getPlayerProfiles = require('../../../modules/helpers/xbox/getPlayerProfiles')

module.exports = (fastify, opts, done) => {
  fastify.get('/api/dashboard/getRealmStories/:id', async (req, reply) => {

    const serverID = req.params.id
    const cookie = req.cookies.session
    const realmID = req.query.realmID

    if (!cookie) return reply.status(401).send({ success: false, error: 'No session cookie found' })
    const sessionData = await findSession(cookie, fastify.db)
    if (!sessionData) return reply.status(401).send({ success: false, error: 'Invalid session cookie' })
    const guilds = sessionData.guilds.filter(g => g.owner || (g.permissions & 0x8))
    const isOwner = await doesUserOwnDiscordServer(serverID, guilds)
    if (!isOwner) return reply.status(401).send({ success: false, error: 'You do not own this server' })
    const isSetup = await isServerSetup(serverID, fastify.db)
    if (!isSetup) return reply.status(402).send({ success: false, error: 'Server is not setup' })


    const serverData = await getRealmStories(realmID, serverID, fastify.db)
    if (!serverData.success) return reply.send({ success: false, error: serverData.error })

    const stories = serverData.realmData.result

    let storiesToSend = []

    const sortedStories = stories
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);
  
  for (let i = 0; i < sortedStories.length; i++) {
    const story = sortedStories[i];
    const players = story.players;
    const eventName = story.eventName;
    const time = story.timestamp;
    let allPlayerData = [];
  
    for (let j = 0; j < players.length; j += 15) {
      const batch = players.slice(j, j + 15);
      const batchData = await getPlayerProfiles(batch, serverID, fastify.db);
      if (batchData.success) {
        allPlayerData = allPlayerData.concat(batchData.data);
      } else {
        return reply.send({ success: false, error: batchData.error });
      }
    }
  
    for (let k = 0; k < players.length; k++) {
      const xuid = players[k];
      const playerEntry = allPlayerData.find(p => p.id === xuid);
      if (!playerEntry) continue;
      const playerSettings = playerEntry.settings;
      const usernameEntry = playerSettings.find(p => p.id === 'Gamertag');
      const profilePictureEntry = playerSettings.find(p => p.id === 'GameDisplayPicRaw');
      if (eventName === 'NewMember' && usernameEntry && profilePictureEntry) {
        storiesToSend.push({
          eventName: 'New Member',
          username: usernameEntry.value,
          profilePicture: profilePictureEntry.value,
          time: time
        });
      }
      if (eventName === 'FirstPeakMountainFound' && usernameEntry && profilePictureEntry) {
        storiesToSend.push({
          eventName: `First Mountain Peak Found <span class="text-gray-300">(${playerEntry.coordinates.x}, ${playerEntry.coordinates.y}, ${playerEntry.coordinates.z})</span>`,
          username: usernameEntry.value,
          profilePicture: profilePictureEntry.value,
          time: time
        });
      }



    }
  }
  



    reply.send({ success: true, stories: storiesToSend })

  })
  done()
}
