import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import LanguagesScreen from './languages';
import StepsScreen from './steps';
import ScheduledScreen from './scheduled';
import ProfileScreen from './profile';
import { colors, shadows } from '../../src/constants/theme';

const Tab = createBottomTabNavigator();

const tabs = [
  { name: 'Languages', label: 'Languages', icon: '📚', component: LanguagesScreen },
  { name: 'Steps', label: 'Steps', icon: '✅', component: StepsScreen },
  { name: 'Scheduled', label: 'Scheduled', icon: '🗓️', component: ScheduledScreen },
  { name: 'Profile', label: 'Profile', icon: '👤', component: ProfileScreen },
];

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.text.primary,
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
          ...shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.name === 'Steps' ? 'Learning Steps' : tab.name,
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
                <Text style={[styles.icon, focused ? styles.iconActive : null]}>
                  {tab.icon}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  icon: {
    fontSize: 18,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
});
