import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const devices = await mongoose.connection.collection('devices').find({}).toArray();
    console.log('DEVICES IN REAL DB:', devices);
    
    // forcefully wipe everything in devices to be absolutely sure
    const count = await mongoose.connection.collection('devices').deleteMany({});
    console.log('Deleted all devices:', count.deletedCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};
checkData();
