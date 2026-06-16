import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import { languagesService, learningStepsService } from '../../src/services/firebaseService';
import { sampleLanguages, sampleLearningSteps } from '../../src/config/sampleData';
import { Language, LearningStep } from '../../src/types';
import { Card, Badge } from '../../src/components';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';

export default function ScheduledScreen() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(false);

  const GUEST_SCHEDULED_KEY = '@learning-code-app/guestScheduledSteps';

  const loadGuestStepOverrides = async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_SCHEDULED_KEY);
      return raw ? (JSON.parse(raw) as Record<string, any>) : {};
    } catch {
      return {};
    }
  };

  const saveGuestStepOverrides = async (overrides: Record<string, any>) => {
    try {
      await AsyncStorage.setItem(GUEST_SCHEDULED_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.error('Failed to save guest schedule overrides', error);
    }
  };

  const loadScheduledSteps = async () => {
    setLoading(true);
    try {
      const [loadedLanguages, loadedSteps] = await Promise.all([
        user ? languagesService.getUserLanguages(user.uid) : Promise.resolve(sampleLanguages),
        user ? learningStepsService.getUserSteps(user.uid) : Promise.resolve(sampleLearningSteps),
      ]);

      setLanguages(loadedLanguages.length > 0 ? loadedLanguages : sampleLanguages);

      if (!user) {
        const overrides = await loadGuestStepOverrides();
        setSteps(
          loadedSteps.map((step) => ({
            ...step,
            ...(overrides[step.id] || {}),
            completedAt: overrides[step.id]?.completedAt
              ? new Date(overrides[step.id]!.completedAt as string)
              : step.completedAt,
            scheduledAt: overrides[step.id]?.scheduledAt
              ? (overrides[step.id]!.scheduledAt as string)
              : step.scheduledAt,
          }))
        );
      } else {
        setSteps(loadedSteps);
      }
    } catch {
      setLanguages(sampleLanguages);
      setSteps(sampleLearningSteps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadScheduledSteps(); }, [user]);
  useFocusEffect(React.useCallback(() => { loadScheduledSteps(); }, [user]));

  const languageById = useMemo(
    () => languages.reduce<Record<string, Language>>((acc, lang) => {
      acc[lang.id] = lang;
      return acc;
    }, {}),
    [languages]
  );

  const scheduledSteps = useMemo(
    () => steps
      .filter((step) => step.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()),
    [steps]
  );

  const handleMarkDone = async (step: LearningStep) => {
    try {
      if (!user) {
        const nextSteps = steps.map((s) =>
          s.id === step.id
            ? { ...s, completed: true, completedAt: new Date() }
            : s
        );
        setSteps(nextSteps);

        const overrides = await loadGuestStepOverrides();
        const updated = {
          ...overrides,
          [step.id]: {
            ...overrides[step.id],
            completed: true,
            completedAt: new Date().toISOString(),
          },
        };
        await saveGuestStepOverrides(updated);
        return;
      }
      await learningStepsService.markStepComplete(step.id);
      loadScheduledSteps();
    } catch (error) {
      console.error('Failed to mark step done', error);
    }
  };

  const handleDeleteScheduled = async (step: LearningStep) => {
    try {
      if (!user) {
        const nextSteps = steps.map((s) =>
          s.id === step.id
            ? { ...s, scheduledAt: undefined }
            : s
        );
        setSteps(nextSteps);

        const overrides = await loadGuestStepOverrides();
        const updated = { ...overrides } as Record<string, any>;
        if (updated[step.id]) {
          // Remove scheduledAt from this override; if no keys left, remove the override entirely
          delete updated[step.id].scheduledAt;
          if (Object.keys(updated[step.id]).length === 0) {
            delete updated[step.id];
          }
        }
        await saveGuestStepOverrides(updated);
        return;
      }
      await learningStepsService.clearScheduledAt(step.id);
      loadScheduledSteps();
    } catch (error) {
      console.error('Failed to delete scheduled step', error);
    }
  };

  const renderStepCard = ({ item }: { item: LearningStep }) => {
    const language = languageById[item.languageId];
    return (
      <Card style={[styles.card, item.completed ? styles.cardCompleted : undefined]} padding={spacing.lg}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.stepTitle}>{item.title}</Text>
            {language && (
              <Text style={styles.langText}>{language.icon} {language.name}</Text>
            )}
          </View>
          <Badge label={item.completed ? 'Done' : 'Scheduled'} variant={item.completed ? 'success' : 'warning'} />
        </View>

        <Text style={styles.stepDesc}>{item.description}</Text>
        {item.scheduledAt && (
          <Text style={styles.scheduledText}>
            📅 Scheduled for {new Date(item.scheduledAt).toLocaleDateString()} at {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, item.completed ? styles.actionBtnDone : null]}
            onPress={() => handleMarkDone(item)}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionText, item.completed ? styles.actionTextDone : null]}>
              {item.completed ? 'Completed' : 'Mark Done'}
            </Text>
          </TouchableOpacity>
          {item.completed && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteScheduled(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  if (loading && scheduledSteps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={scheduledSteps}
        renderItem={renderStepCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={styles.emptyText}>No scheduled steps yet</Text>
            <Text style={styles.emptySubtext}>Schedule a step from any language to see it here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 24,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  langText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  stepDesc: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  scheduledText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  actionBtnDone: {
    backgroundColor: colors.success,
  },
  actionText: {
    color: colors.text.inverse,
    fontWeight: '700',
  },
  actionTextDone: {
    color: colors.text.inverse,
  },
  deleteBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.danger || '#EF4444',
    marginLeft: spacing.sm,
  },
  deleteBtnText: {
    color: colors.text.inverse,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
