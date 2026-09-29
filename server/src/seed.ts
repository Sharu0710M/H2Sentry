import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Device } from './models/Device';
import { SensorReading } from './models/SensorReading';
import { ExposureEvent } from './models/ExposureEvent';
import { StripImage } from './models/StripImage';
import { generateHistoricalData } from './services/mockDataService';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany();
    await Device.deleteMany();
    await SensorReading.deleteMany();
    await ExposureEvent.deleteMany();
    await StripImage.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@h2sguard.com', employeeId: 'ADM-001', role: 'ADMIN', password },
      { name: 'Safety Officer', email: 'safety@h2sguard.com', employeeId: 'SAF-001', role: 'SAFETY_OFFICER', password },
      { name: 'Field Worker 1', email: 'worker1@h2sguard.com', employeeId: 'WRK-001', role: 'WORKER', password },
      { name: 'Field Worker 2', email: 'worker2@h2sguard.com', employeeId: 'WRK-002', role: 'WORKER', password }
    ]);

    const workers = users.filter(u => u.role === 'WORKER');
    
    await Device.insertMany([
      { deviceId: 'DEV-MOCK-001', workerId: workers[0]._id, status: 'ONLINE', dataSource: 'mock' },
      { deviceId: 'DEV-MOCK-002', workerId: workers[1]._id, status: 'ONLINE', dataSource: 'mock' }
    ]);

    console.log('Generating 30 days of historical data... (this might take a few seconds)');
    await generateHistoricalData();

    console.log('Seed data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
