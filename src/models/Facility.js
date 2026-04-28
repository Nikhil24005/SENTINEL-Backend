import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    type: {
      type: String,
      enum: ['hotel', 'mall', 'stadium'],
    },
    address: String,
    totalOccupancy: Number,
    currentOccupancy: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Facility', facilitySchema);
