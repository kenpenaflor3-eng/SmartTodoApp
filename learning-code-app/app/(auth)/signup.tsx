import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Input, LoadingScreen } from '../../src/components';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';

export default function SignUpScreen() {
  const { signUp, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return <LoadingScreen message="Creating your account..." />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🚀</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Get Started</Text>
          <Text style={styles.welcomeSubtitle}>Begin your learning adventure</Text>
        </View>

        <View style={styles.formCard}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={displayName}
            onChangeText={(t) => { setDisplayName(t); setErrors((e) => ({ ...e, displayName: '' })); }}
            autoCapitalize="words"
            icon="👤"
            error={errors.displayName}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="✉️"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
            isPassword
            icon="🔒"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: '' })); }}
            isPassword
            icon="🔐"
            error={errors.confirmPassword}
          />

          <Button
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Sign in instead"
            onPress={() => router.push('/signin')}
            variant="outline"
            size="lg"
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    color: colors.text.muted,
    fontSize: 14,
  },
});
