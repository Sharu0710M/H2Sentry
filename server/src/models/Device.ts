import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'], default: 'ONLINE' },
  dataSource: { type: String, enum: ['mock', 'blynk'], default: 'mock' },
  lastSeen: { type: Date, default: Date.now },
  battery: { type: Number, default: 100 },
}, { timestamps: true });

export const Device = mongoose.model('Device', DeviceSchema);
