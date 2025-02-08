let memberList = [];

module.exports = (fastify, opts, done) => {
  fastify.post('/api/fairplay/setMemberlist/:realmid', async (req, reply) => {
    try {
      const { realmid } = req.params;
      const newMembers = req.body;
      const index = memberList.findIndex(item => item.realmid === realmid);
      if (index !== -1) {
        memberList[index].list = newMembers;
      } else {
        memberList.push({ realmid, list: newMembers });
      }
      reply.send({ success: true });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  fastify.get('/api/fairplay/setMemberlist/:realmid', async (req, reply) => {
    try {
      const { realmid } = req.params;
      const entry = memberList.find(item => item.realmid === realmid);
      reply.send({ success: true, list: entry ? entry.list : [] });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  done();
};
