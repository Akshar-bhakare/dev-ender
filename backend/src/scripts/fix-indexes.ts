import 'dotenv/config';
import mongoose from 'mongoose';

async function fix() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }

  try {
    console.log('Connecting to DB...');
    await mongoose.connect(mongoURI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    if (!db) throw new Error('DB not found');

    const collections = await db.listCollections({ name: 'companies' }).toArray();
    if (collections.length > 0) {
      console.log('Dropping rogue index name_1 from companies collection...');
      try {
        await db.collection('companies').dropIndex('name_1');
        console.log('✅ Index name_1 dropped successfully.');
      } catch (err: any) {
        if (err.codeName === 'IndexNotFound' || err.message.includes('not found')) {
          console.log('ℹ️ Index name_1 already gone or not found.');
        } else {
          console.error('❌ Failed to drop index:', err.message);
        }
      }
    }

    console.log('Closing connection...');
    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (err: any) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

fix();
