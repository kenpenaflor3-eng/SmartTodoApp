import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import { languagesService, learningStepsService } from '../../src/services/firebaseService';
import { scheduleStepNotification } from '../../src/services/notificationService';
import { sampleLanguages, sampleLearningSteps } from '../../src/config/sampleData';
import { Language, LearningStep } from '../../src/types';
import { Card, Badge, ScheduleModal } from '../../src/components';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';

export default function StepsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = (route.params as { languageId?: string } | undefined) ?? {};
  const selectedLanguageId = params.languageId;
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduleStep, setScheduleStep] = useState<LearningStep | null>(null);

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

  const loadAllSteps = async () => {
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

  useEffect(() => { loadAllSteps(); }, [user]);
  useFocusEffect(React.useCallback(() => { loadAllSteps(); }, [user]));

  const languageById = useMemo(
    () => languages.reduce<Record<string, Language>>((acc, lang) => {
      acc[lang.id] = lang;
      return acc;
    }, {}),
    [languages]
  );

  const displayedSteps = useMemo(() => {
    const filtered = selectedLanguageId
      ? steps.filter((step) => step.languageId === selectedLanguageId && !step.scheduledAt)
      : steps.filter((step) => !step.scheduledAt);

    if (filtered.length > 0) {
      return filtered;
    }

    if (selectedLanguageId) {
      return sampleLearningSteps.filter((step) => step.languageId === selectedLanguageId && !step.scheduledAt);
    }

    return user ? sampleLearningSteps.filter((step) => !step.scheduledAt) : filtered;
  }, [steps, selectedLanguageId, user]);

  const selectedLanguage = useMemo(
    () => (selectedLanguageId ? languageById[selectedLanguageId] : null),
    [languageById, selectedLanguageId]
  );

  const nextScheduledAt = useMemo(() => {
    const scheduledSteps = displayedSteps
      .filter((step) => step.scheduledAt)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
      );
    return scheduledSteps[0]?.scheduledAt ?? null;
  }, [displayedSteps]);

  const handleToggleComplete = async (id: string, markComplete: boolean) => {
    try {
      if (!user) {
        const nextSteps = steps.map((step) =>
          step.id === id
            ? { ...step, completed: markComplete, completedAt: markComplete ? new Date() : undefined }
            : step
        );
        setSteps(nextSteps);

        const overrides = await loadGuestStepOverrides();
        const updated = {
          ...overrides,
          [id]: {
            ...overrides[id],
            completed: markComplete,
            completedAt: markComplete ? new Date().toISOString() : undefined,
          },
        };
        await saveGuestStepOverrides(updated);
        return;
      }
      if (markComplete) {
        await learningStepsService.markStepComplete(id);
      } else {
        await learningStepsService.updateStep(id, { completed: false, completedAt: undefined });
      }
      loadAllSteps();
    } catch (error) {
      console.error('Step update error:', error);
    }
  };

  const handleScheduleSave = async (iso: string) => {
    if (!scheduleStep) return;
    try {
      if (user) {
        await learningStepsService.updateStep(scheduleStep.id, { scheduledAt: iso });
        // Schedule notification for the task
        const updatedStep = { ...scheduleStep, scheduledAt: iso };
        await scheduleStepNotification(updatedStep);
        loadAllSteps();
      } else {
        const nextSteps = steps.map((s) => (s.id === scheduleStep.id ? { ...s, scheduledAt: iso } : s));
        setSteps(nextSteps);
        const overrides = await loadGuestStepOverrides();
        const updated = {
          ...overrides,
          [scheduleStep.id]: {
            ...overrides[scheduleStep.id],
            scheduledAt: iso,
          },
        };
        await saveGuestStepOverrides(updated);
        // Schedule notification for the task
        const updatedStep = { ...scheduleStep, scheduledAt: iso };
        await scheduleStepNotification(updatedStep);
      }
      navigation.navigate('Scheduled');
    } catch (error) {
      console.error('Schedule error', error);
    }
  };

  const openYouTube = async (query: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open YouTube', error);
    }
  };

  const renderStepCard = ({ item }: { item: LearningStep }) => {
    const lang = languageById[item.languageId];
    return (
      <Card style={[styles.card, item.completed ? styles.cardCompleted : undefined]} padding={spacing.lg}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {lang && (
              <View style={styles.langBadgeSmall}>
                <Text style={styles.langBadgeText}>{lang.icon} {lang.name}</Text>
              </View>
            )}
            <Badge
              label={item.completed ? 'Completed' : 'Pending'}
              variant={item.completed ? 'success' : 'info'}
            />
          </View>
          {item.scheduledAt && (
            <Text style={styles.scheduledBadge}>
              📅 {new Date(item.scheduledAt).toLocaleDateString()} at {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <Text style={[styles.stepTitle, item.completed ? styles.stepTitleDone : null]}>
          {item.title}
        </Text>
        <Text style={styles.stepDesc}>{item.description}</Text>

        {item.resources.length > 0 && (
          <View style={styles.resourcesWrap}>
            <Text style={styles.resourcesLabel}>📎 Resources</Text>
            {item.resources.map((r, i) => (
              <TouchableOpacity key={i} onPress={() => openYouTube(r)}>
                <Text style={styles.resourceItemLink}>• {r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, item.completed ? styles.actionBtnUndo : null]}
            onPress={() => handleToggleComplete(item.id, !item.completed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkCircle, item.completed ? styles.checkCircleDone : null]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.actionText, item.completed ? styles.actionTextUndo : null]}>
              {item.completed ? 'Undo' : 'Mark Done'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { setScheduleStep(item); setScheduleVisible(true); }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading && steps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedLanguage && (
        <View style={styles.languageHeader}>
          <Text style={styles.languageTitle}>{selectedLanguage.name}</Text>
          <Text style={styles.languageSubtitle}>
            {nextScheduledAt
              ? `Next session: ${new Date(nextScheduledAt).toLocaleString()}`
              : 'No scheduled session yet'}
          </Text>
        </View>
      )}
      <FlatList
        data={displayedSteps}
        renderItem={renderStepCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>
              {selectedLanguageId ? 'No steps found for this language' : 'No learning steps yet'}
            </Text>
            <Text style={styles.emptySubtext}>Add steps from a language to get started</Text>
          </View>
        }
      />
      <ScheduleModal
        visible={scheduleVisible}
        onClose={() => { setScheduleVisible(false); setScheduleStep(null); }}
        onSave={handleScheduleSave}
        initialDate={scheduleStep?.scheduledAt}
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
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langBadgeSmall: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  scheduledBadge: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  stepTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  stepTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  stepDesc: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  resourcesWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  resourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  resourceItem: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  resourceItemLink: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  actionBtnUndo: {
    backgroundColor: colors.dangerLight,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  actionTextUndo: {
    color: colors.danger,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
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
  languageHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  languageTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  languageSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
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
