import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    id: String,
    incidentId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    roleNeeded: String,
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'en-route', 'arrived', 'resolved'],
      default: 'assigned',
    },
    etaMinutes: Number,
    distanceMeters: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
