import mongoose from 'mongoose';

const floorSchema = new mongoose.Schema(
  {
    id: String,
    facilityId: mongoose.Schema.Types.ObjectId,
    name: String,
    level: Number,
    occupancy: Number,
    totalOccupancy: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Floor', floorSchema);
