import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    id: String,
    zoneId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['smoke_sensor', 'gas_sensor', 'panic_button', 'crowd_sensor', 'camera'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'malfunction'],
      default: 'active',
    },
    lastReading: mongoose.Schema.Types.Mixed,
    lastReadingTime: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Device', deviceSchema);
