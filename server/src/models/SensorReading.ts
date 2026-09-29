import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  h2s: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, enum: ['mock', 'blynk'], default: 'mock' }
});

// Index for fast time-series queries
SensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

export const SensorReading = mongoose.model('SensorReading', SensorReadingSchema);
