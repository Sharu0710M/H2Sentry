import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String },
  role: { 
    type: String, 
    enum: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'], 
    default: 'WORKER' 
  },
  password: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
