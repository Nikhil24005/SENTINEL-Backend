import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

// Mock notification providers
const sendSMS = async (phone, message) => {
  console.log(`[SMS] To: ${phone}, Message: ${message}`);
  return { success: true, provider: 'twilio' };
};

const sendEmail = async (email, subject, message) => {
  console.log(`[EMAIL] To: ${email}, Subject: ${subject}, Message: ${message}`);
  return { success: true, provider: 'sendgrid' };
};

const createInAppNotification = async (userId, message) => {
  console.log(`[IN-APP] User: ${userId}, Message: ${message}`);
  return { success: true, provider: 'in-app' };
};

// Send notification
export const sendNotification = async (userId, incidentId, message, channels = ['in-app']) => {
  const notifications = [];

  for (const channel of channels) {
    const notification = new Notification({
      id: uuidv4(),
      incidentId,
      userId,
      channel,
      recipient: userId,
      status: 'sent',
      message,
    });

    try {
      if (channel === 'sms') {
        await sendSMS(userId, message);
      } else if (channel === 'email') {
        await sendEmail(userId, 'SENTINEL Alert', message);
      } else if (channel === 'in-app') {
        await createInAppNotification(userId, message);
      }

      await notification.save();
      notifications.push(notification);
    } catch (error) {
      notification.status = 'failed';
      await notification.save();
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }

  return notifications;
};

// Broadcast notification to multiple users
export const broadcastNotification = async (userIds, incidentId, message, channels = ['in-app']) => {
  const notifications = [];

  for (const userId of userIds) {
    const sent = await sendNotification(userId, incidentId, message, channels);
    notifications.push(...sent);
  }

  return notifications;
};

// Get user notifications
export const getNotifications = async (userId, limit = 50) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { status: 'read' }, { new: true });
};
