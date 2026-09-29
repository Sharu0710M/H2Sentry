import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const wipeData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected! Wiping mock data...');

    // Delete mock devices
    const devicesDeleted = await mongoose.connection.collection('devices').deleteMany({ deviceId: { $regex: 'MOCK', $options: 'i' } });
    console.log(`Deleted ${devicesDeleted.deletedCount} mock devices.`);

    // Delete all historical readings to start completely fresh for the presentation
    const readingsDeleted = await mongoose.connection.collection('sensorreadings').deleteMany({});
    console.log(`Deleted ${readingsDeleted.deletedCount} old sensor readings.`);

    const eventsDeleted = await mongoose.connection.collection('exposureevents').deleteMany({});
    console.log(`Deleted ${eventsDeleted.deletedCount} old exposure events.`);

    const imagesDeleted = await mongoose.connection.collection('stripimages').deleteMany({});
    console.log(`Deleted ${imagesDeleted.deletedCount} old strip images.`);

    console.log('âœ… Database is now completely clean and ready for real hardware data!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

wipeData();
