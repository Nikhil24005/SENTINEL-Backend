import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: String,
    incidentId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    channel: {
      type: String,
      enum: ['in-app', 'sms', 'email'],
    },
    recipient: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
