import mongoose from 'mongoose';

const ExposureEventSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  h2s: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  severity: { type: String, enum: ['CAUTION', 'ELEVATED', 'CRITICAL'], required: true },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 } // in seconds
});

export const ExposureEvent = mongoose.model('ExposureEvent', ExposureEventSchema);
