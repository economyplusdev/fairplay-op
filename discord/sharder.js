const dotenv = require('dotenv');
const { ClusterManager, HeartbeatManager, ReClusterManager } = require('discord-hybrid-sharding');

dotenv.config();

const token = process.env.TOKEN;

const manager = new ClusterManager(`${__dirname}/bot.js`, {
    totalShards: 'auto', 
    mode: 'process', 
    // timeout: -1,
    token: token,
    respawn: true
});
manager.extend(
    new HeartbeatManager({
        interval: 2000,
        maxMissedHeartbeats: 5,
    }),
    new ReClusterManager()
)

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ amount: 'auto', delay: 25000, timeout: 60000 });