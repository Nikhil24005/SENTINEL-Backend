import mongoose from 'mongoose';

const drillRunSchema = new mongoose.Schema(
  {
    id: String,
    facilityId: mongoose.Schema.Types.ObjectId,
    scenario: String,
    score: Number,
    startedAt: Date,
    endedAt: Date,
    report: String,
    timeline: [mongoose.Schema.Types.Mixed],
    incidentIds: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

export default mongoose.model('DrillRun', drillRunSchema);
