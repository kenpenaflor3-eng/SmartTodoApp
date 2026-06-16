import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../constants/theme';

type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
}

const badgeStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  info: { bg: colors.infoLight, text: colors.info },
  danger: { bg: colors.dangerLight, text: colors.danger },
  default: { bg: colors.primaryLight, text: colors.primary },
};

export default function Badge({ label, variant = 'default', icon }: BadgeProps) {
  const style = badgeStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  icon: {
    fontSize: 12,
    marginRight: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
