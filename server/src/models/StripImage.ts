import mongoose from 'mongoose';

const StripImageSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, required: true },
  capturedAt: { type: Date, default: Date.now },
  classification: { type: String, enum: ['NORMAL', 'SLIGHT', 'MODERATE', 'HIGH'], required: true },
  confidence: { type: Number, required: true },
  detectedColor: { type: String, required: true },
  associatedH2s: { type: Number }
});

StripImageSchema.index({ deviceId: 1, capturedAt: -1 });

export const StripImage = mongoose.model('StripImage', StripImageSchema);
