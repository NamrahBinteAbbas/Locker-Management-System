const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:admin123@cluster0.utfnhbx.mongodb.net/?appName=Cluster0"; // Paste your connection string
let db;
let client;

const connectDB = async () => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('locker_management');
    console.log('✅ MongoDB Atlas Connected');
     // 🔹 Ping to verify connection
     await db.command({ ping: 1 });
     console.log('✅ Ping successful! DB is alive.');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = { connectDB, getDB };