import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    id: String,
    zoneId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['AED', 'extinguisher', 'exit', 'assembly_point'],
    },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'unavailable'],
      default: 'operational',
    },
    x: Number,
    y: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Asset', assetSchema);
