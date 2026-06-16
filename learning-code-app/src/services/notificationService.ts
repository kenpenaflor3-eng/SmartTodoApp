import * as Notifications from 'expo-notifications';
import { LearningStep } from '../types';

// Configure how notifications should be handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Schedule a notification for a learning step at its scheduled time
 */
export const scheduleStepNotification = async (step: LearningStep): Promise<string | null> => {
  try {
    if (!step.scheduledAt) {
      return null;
    }

    const scheduledDate = new Date(step.scheduledAt);
    const now = new Date();

    // Only schedule if the time is in the future
    if (scheduledDate <= now) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Learning Time!',
        body: `Time to work on: ${step.title}`,
        data: {
          stepId: step.id,
          languageId: step.languageId,
          stepTitle: step.title,
        },
      },
      trigger: {
        type: 'date',
        date: scheduledDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification by its ID
 */
export const cancelStepNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};
