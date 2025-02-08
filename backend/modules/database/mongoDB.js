const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'myDatabase';

let client;
let db;

const connectDB = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }
};

const getCollection = (collectionName) => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection(collectionName);
};

const findOne = async (collectionName, query) => {
  const collection = getCollection(collectionName);
  return collection.findOne(query);
};

const insertOne = async (collectionName, document) => {
  const collection = getCollection(collectionName);
  return collection.insertOne(document);
};

const updateOne = async (collectionName, query, update) => {
  const collection = getCollection(collectionName);
  return collection.updateOne(query, update);
}
const deleteOne = async (collectionName, query) => {
  const collection = getCollection(collectionName);
  return collection.deleteOne(query);
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

module.exports = {
  connectDB,
  findOne,
  insertOne,
  closeDB,
  updateOne,
  deleteOne,
};
