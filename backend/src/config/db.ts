import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB Connected via Mongoose...');
  } catch (err: any) {
    console.error('Error connecting to MongoDB:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};
