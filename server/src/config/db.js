import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');

  mongoose.set('strictQuery', true);
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.log('MongoDB connected');
};
