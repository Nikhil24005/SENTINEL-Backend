import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    id: String,
    facilityId: mongoose.Schema.Types.ObjectId,
    floorId: mongoose.Schema.Types.ObjectId,
    zoneId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['fire', 'smoke', 'gas_leak', 'medical', 'panic_button', 'crowd_surge', 'suspicious_activity'],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    status: {
      type: String,
      enum: ['new', 'acknowledged', 'in-progress', 'resolved'],
      default: 'new',
    },
    source: {
      type: String,
      enum: ['sensor', 'manual', 'qr_help', 'simulation'],
    },
    riskScore: Number,
    description: String,
    createdAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    resolvedAt: Date,
    discoveryZoneId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.model('Incident', incidentSchema);
