import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, typography } from '../src/constants/theme';

export default function Index() {
  const { isSignedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(isSignedIn ? '/languages' : '/signin');
    }
  }, [isSignedIn, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  text: {
    ...typography.caption,
  },
});
