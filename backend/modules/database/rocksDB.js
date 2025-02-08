const RocksDB = require('rocksdb');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../rocksDB');

const db = RocksDB(dbPath);

const openDB = () =>
  new Promise((resolve, reject) => {
    db.open((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const get = (key) =>
  new Promise((resolve, reject) => {
    db.get(key, (err, result) => {
      if (err) reject(err);
      else resolve(result ? result.toString() : null);
    });
  });

const put = (key, value) =>
  new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

module.exports = {
  openDB,
  get,
  put,
};
