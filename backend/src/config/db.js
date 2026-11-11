const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      const mongoose = require('mongoose');
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to external MongoDB: ${err.message}`);
      console.log(`⚡ Using lightweight In-Memory / File-based Database (Zero-dependency Mode)`);
      return null;
    }
  } else {
    console.log(`⚡ In-Memory / File Database Active (Data persisted at backend/data/db.json)`);
    return null;
  }
};

module.exports = connectDB;
