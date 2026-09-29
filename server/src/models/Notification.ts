import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The user who should see this notification (e.g. Safety Officer)
    required: false
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The worker this notification is about (if applicable)
    required: false
  },
  type: {
    type: String,
    enum: ['CRITICAL', 'WARNING', 'SYSTEM', 'DEVICE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
