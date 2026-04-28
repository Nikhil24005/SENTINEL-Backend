import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['admin', 'security', 'medic', 'firewarden', 'staff'],
      default: 'staff',
    },
    phone: String,
    status: {
      type: String,
      enum: ['available', 'on-task', 'on-break'],
      default: 'available',
    },
    currentZoneId: mongoose.Schema.Types.ObjectId,
    facilityId: mongoose.Schema.Types.ObjectId,
    floorId: mongoose.Schema.Types.ObjectId,
    location: {
      x: Number,
      y: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
