const exampleRoutes = async (fastify) => {
    fastify.get('/rocksdb-get', async (req, reply) => {
      const { key } = req.query;
      if (!key) {
        return reply.code(400).send({ error: 'Key is required' });
      }
  
      try {
        const value = await fastify.db.rocksdbGet(key);
        return { key, value };
      } catch (err) {
        return reply.code(500).send({ error: err.message });
      }
    });
  
    fastify.post('/rocksdb-put', async (req, reply) => {
      const { key, value } = req.body;
      if (!key || !value) {
        return reply.code(400).send({ error: 'Key and value are required' });
      }
  
      try {
        await fastify.db.rocksdbPut(key, value);
        return { message: 'Key-value pair saved successfully' };
      } catch (err) {
        return reply.code(500).send({ error: err.message });
      }
    });
  
    fastify.get('/mongodb-find-one', async (req, reply) => {
      const { collectionName, query } = req.query;
      if (!collectionName || !query) {
        return reply.code(400).send({ error: 'Collection name and query are required' });
      }
  
      try {
        const parsedQuery = JSON.parse(query);
        const result = await fastify.db.mongoFindOne(collectionName, parsedQuery);
        return { result };
      } catch (err) {
        return reply.code(500).send({ error: err.message });
      }
    });
  
    fastify.post('/mongodb-insert-one', async (req, reply) => {
      const { collectionName, document } = req.body;
      if (!collectionName || !document) {
        return reply.code(400).send({ error: 'Collection name and document are required' });
      }
  
      try {
        const parsedDocument = JSON.parse(document);
        const result = await fastify.db.mongoInsertOne(collectionName, parsedDocument);
        return { message: 'Document inserted successfully', insertedId: result.insertedId };
      } catch (err) {
        return reply.code(500).send({ error: err.message });
      }
    });
  };
  
  module.exports = exampleRoutes;
  