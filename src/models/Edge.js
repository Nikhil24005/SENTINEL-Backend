import mongoose from 'mongoose';

const edgeSchema = new mongoose.Schema(
  {
    id: String,
    floorId: mongoose.Schema.Types.ObjectId,
    fromZoneId: mongoose.Schema.Types.ObjectId,
    toZoneId: mongoose.Schema.Types.ObjectId,
    distance: Number,
    accessible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Edge', edgeSchema);
