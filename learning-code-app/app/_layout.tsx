import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '../src/context/AuthContext';
import { requestNotificationPermissions } from '../src/services/notificationService';

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on app startup
    requestNotificationPermissions();

    // Listen for notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification responses (when user taps on notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { stepId } = response.notification.request.content.data;
      console.log('Notification tapped, step ID:', stepId);
      // You can navigate to the step or scheduled screen here if needed
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
