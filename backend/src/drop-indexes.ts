import mongoose, { connect } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function dropIndexes() {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    // Drop all indexes on conversations collection except _id
    const collection = db.collection('conversations');
    await collection.dropIndexes();
    console.log('✅ Dropped all indexes on conversations collection');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndexes();

