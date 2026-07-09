import mongoose from 'mongoose';
import { setupMongooseMock } from '../utils/localDBFallback.js';

const connectDB = async () => {
  try {
    // Attempt to connect with a 3-second selection timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If MongoDB is offline/not installed, start in Local JSON mode
    setupMongooseMock();
  }
};

export default connectDB;
