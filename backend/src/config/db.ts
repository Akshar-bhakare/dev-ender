import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('✅ MongoDB Connected successfully!');
  } catch (err: any) {
    console.error('❌ Error connecting to MongoDB:');
    console.error('Message:', err.message);
    if (err.reason) {
      console.error('Reason:', JSON.stringify(err.reason, null, 2));
    }
    // Exit process with failure
    // process.exit(1);
  }
};
