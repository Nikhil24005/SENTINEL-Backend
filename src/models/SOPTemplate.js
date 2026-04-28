import mongoose from 'mongoose';

const sopTemplateSchema = new mongoose.Schema(
  {
    id: String,
    incidentType: String,
    title: String,
    steps: [String],
    announcementText: String,
  },
  { timestamps: true }
);

export default mongoose.model('SOPTemplate', sopTemplateSchema);
