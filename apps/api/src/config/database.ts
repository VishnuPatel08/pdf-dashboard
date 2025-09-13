// apps/api/src/config/database.ts
import { MongoClient, Db, GridFSBucket } from 'mongodb';

let client: MongoClient;
let db: Db;
let gridFS: GridFSBucket;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    
    db = client.db('pdf-dashboard');
    gridFS = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export { db, gridFS, client };
