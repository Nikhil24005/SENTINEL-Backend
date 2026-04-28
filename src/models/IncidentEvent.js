import mongoose from 'mongoose';

const incidentEventSchema = new mongoose.Schema(
  {
    id: String,
    incidentId: mongoose.Schema.Types.ObjectId,
    type: String,
    timestamp: { type: Date, default: Date.now },
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('IncidentEvent', incidentEventSchema);
