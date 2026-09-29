import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import sensorRoutes from './routes/sensorRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import predictionRoutes from './routes/predictionRoutes';
import workerRoutes from './routes/workerRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'H2S GUARD API is running (PHASE 3)' });
});

// Seed function for Memory DB
const seedMemoryDB = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    await User.insertMany([
      { name: 'Admin User', email: 'admin@h2sguard.com', employeeId: 'ADM-001', role: 'ADMIN', password },
      { name: 'Safety Officer', email: 'safety@h2sguard.com', employeeId: 'SAF-001', role: 'SAFETY_OFFICER', password },
      { name: 'Field Worker', email: 'worker@h2sguard.com', employeeId: 'WRK-001', role: 'WORKER', password }
    ]);
    console.log('🌱 In-Memory Database seeded with demo accounts.');
  }
};

// Database Connection Logic
const connectDB = async () => {
  try {
    // Try to connect to real MongoDB first
    await mongoose.connect(process.env.MONGODB_URI as string, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to real MongoDB');
  } catch (error) {
    console.log('⚠️ Could not connect to real MongoDB. Starting In-Memory Database...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('🚀 Connected to In-Memory MongoDB');
      await seedMemoryDB();
    } catch (memError) {
      console.error('Failed to start In-Memory DB:', memError);
    }
  }
};

import { fetchBlynkData } from './services/blynkService';

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();

  // Start background data poller for Blynk
  if (process.env.DATA_PROVIDER === 'blynk') {
    console.log('🔄 Blynk IoT Provider Active. Starting background polling...');
    setInterval(async () => {
      try {
        await fetchBlynkData();
      } catch (err) {
        // Silent fail for periodic poll to avoid console spam
      }
    }, 5000); // Poll every 5 seconds
  }
});
