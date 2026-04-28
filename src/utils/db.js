import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel';

    // Use mongoose defaults; options like useNewUrlParser/useUnifiedTopology are deprecated in newer drivers
    const connection = await mongoose.connect(MONGO_URI);

    isConnected = connection.connections[0].readyState === 1;
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
