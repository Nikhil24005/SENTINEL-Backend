import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    id: String,
    floorId: mongoose.Schema.Types.ObjectId,
    facilityId: mongoose.Schema.Types.ObjectId,
    name: String,
    type: {
      type: String,
      enum: ['room', 'corridor', 'stairwell', 'exit', 'assembly_point', 'service'],
    },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    occupancy: Number,
    blocked: Boolean,
    riskScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Zone', zoneSchema);
