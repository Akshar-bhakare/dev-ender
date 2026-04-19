import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';

async function cleanup() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }

  try {
    console.log('Connecting to DB...');
    await mongoose.connect(mongoURI);
    
    // Replace with the email you are trying to register
    const targetEmail = 'aksharbhakare@gmail.com'; 

    console.log(`Cleaning up orphaned records for: ${targetEmail}`);

    const user = await User.findOne({ email: targetEmail });
    if (user) {
        console.log(`Found user: ${user._id} (Status: ${user.status})`);
        
        // Remove associated company if any
        const companyDel = await Company.deleteMany({ ownerId: user._id });
        console.log(`Deleted ${companyDel.deletedCount} company records.`);

        // Only delete the user if they are stuck in onboarding
        if (user.status === 'onboarding') {
            await User.deleteOne({ _id: user._id });
            console.log(`✅ User record deleted. Email is now free.`);
        } else {
            console.log(`⚠️ User is NOT in onboarding status. Skipping deletion to prevent data loss.`);
        }
    } else {
        console.log('No user found with this email.');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err: any) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

cleanup();
