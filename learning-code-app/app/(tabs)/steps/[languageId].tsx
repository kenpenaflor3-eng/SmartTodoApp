import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../src/context/AuthContext';
import { languagesService, learningStepsService } from '../../../src/services/firebaseService';
import { scheduleStepNotification } from '../../../src/services/notificationService';
import {
  sampleLanguages,
  getSampleStepsForLanguage,
  createDefaultStepsForLanguage,
} from '../../../src/config/sampleData';
import { Language, LearningStep } from '../../../src/types';
import { Card, Badge, ScheduleModal } from '../../../src/components';
import { colors, spacing, typography, shadows, borderRadius } from '../../../src/constants/theme';

export default function LanguageStepsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const route = useRoute();
  const params = (route.params as { languageId?: string } | undefined) ?? {};
  const languageId = params.languageId;
  const [language, setLanguage] = useState<Language | null>(null);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [stepResources, setStepResources] = useState('');
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduleStep, setScheduleStep] = useState<LearningStep | null>(null);

  const getLanguageInfo = async () => {
    if (!languageId) return;
    try {
      if (!user) {
        setLanguage(sampleLanguages.find((l) => l.id === languageId) || null);
        return;
      }
      const userLangs = await languagesService.getUserLanguages(user.uid);
      setLanguage(
        userLangs.find((l) => l.id === languageId) ||
          sampleLanguages.find((l) => l.id === languageId) ||
          null
      );
    } catch {
      setLanguage(sampleLanguages.find((l) => l.id === languageId) || null);
    }
  };

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

  const getFallbackSteps = (): LearningStep[] => {
    if (!languageId || !language) return [];
    const s = getSampleStepsForLanguage(languageId);
    return s.length > 0 ? s : createDefaultStepsForLanguage(language);
  };

  const loadSteps = async () => {
    if (!languageId) return;
    setLoading(true);
    try {
      if (!user) {
        const overrides = await loadGuestStepOverrides();
        setSteps(
          getFallbackSteps().map((step) => ({
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
        return;
      }
      const data = await learningStepsService.getLanguageSteps(languageId, user.uid);
      setSteps(data.length > 0 ? data : getFallbackSteps());
    } catch {
      setSteps(getFallbackSteps());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getLanguageInfo(); }, [languageId, user]);
  useEffect(() => { loadSteps(); }, [languageId, user, language]);
  useFocusEffect(useCallback(() => { loadSteps(); }, [languageId, user, language]));

  const unscheduledSteps = useMemo(
    () => steps.filter((step) => !step.scheduledAt),
    [steps]
  );

  const handleCompleteStep = async (id: string, completed: boolean) => {
    try {
      if (!user) {
        setSteps((cur) =>
          cur.map((s) =>
            s.id === id ? { ...s, completed, completedAt: completed ? new Date() : undefined } : s
          )
        );
        return;
      }
      if (completed) {
        await learningStepsService.markStepComplete(id);
      } else {
        await learningStepsService.updateStep(id, { completed: false, completedAt: undefined });
      }
      loadSteps();
    } catch (error) {
      Alert.alert('Error', 'Failed to update step');
    }
  };

  const handleAddStep = async () => {
    if (!stepTitle || !stepDesc || !languageId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Sign in to add learning steps');
      return;
    }
    try {
      const resources = stepResources
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      await learningStepsService.addStep({
        languageId,
        title: stepTitle,
        description: stepDesc,
        resources,
        completed: false,
        order: steps.length + 1,
        userId: user.uid,
      });
      setStepTitle('');
      setStepDesc('');
      setStepResources('');
      setAddModalVisible(false);
      loadSteps();
    } catch {
      Alert.alert('Error', 'Failed to add step');
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
        await loadSteps();
      } else {
        setSteps((cur) =>
          cur.map((s) => (s.id === scheduleStep.id ? { ...s, scheduledAt: iso } : s))
        );
        const overrides = await loadGuestStepOverrides();
        await saveGuestStepOverrides({
          ...overrides,
          [scheduleStep.id]: {
            ...overrides[scheduleStep.id],
            scheduledAt: iso,
          },
        });
        // Schedule notification for the task
        const updatedStep = { ...scheduleStep, scheduledAt: iso };
        await scheduleStepNotification(updatedStep);
      }
      navigation.navigate('Scheduled');
    } catch {
      console.error('Schedule error');
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

  const renderStepCard = ({ item }: { item: LearningStep }) => (
    <Card style={[styles.card, item.completed ? styles.cardCompleted : undefined]}>
      <View style={styles.cardRow}>
        <TouchableOpacity
          style={styles.checkboxTouch}
          onPress={() => handleCompleteStep(item.id, !item.completed)}
        >
          <View style={[styles.checkbox, item.completed ? styles.checkboxDone : null]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.stepContent}>
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepTitle, item.completed ? styles.stepTitleDone : null]}>
              {item.title}
            </Text>
            {item.completed && <Badge label="Done" variant="success" />}
          </View>
          <Text style={styles.stepDesc}>{item.description}</Text>

          {item.scheduledAt && (
            <Text style={styles.scheduledText}>
              📅 {new Date(item.scheduledAt).toLocaleString()}
            </Text>
          )}

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
              style={styles.scheduleBtn}
              onPress={() => { setScheduleStep(item); setScheduleVisible(true); }}
            >
              <Text style={styles.scheduleBtnText}>📅 Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (!languageId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No language selected.</Text>
      </View>
    );
  }

  if (loading && steps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.languageHeader}>
        <View style={styles.languageHeaderContent}>
          <View style={[styles.langIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.langIcon}>{language?.icon || '📚'}</Text>
          </View>
          <View style={styles.langInfo}>
            <Text style={styles.langLabel}>LEARNING</Text>
            <Text style={styles.langName}>{language?.name || 'Loading...'}</Text>
          </View>
        </View>
        <View style={styles.langMeta}>
          <Text style={styles.stepCount}>{unscheduledSteps.length} step{unscheduledSteps.length !== 1 ? 's' : ''}</Text>
          {language?.difficulty && (
            <Badge label={language.difficulty} variant={
              language.difficulty === 'beginner' ? 'success' :
              language.difficulty === 'intermediate' ? 'warning' : 'danger'
            } />
          )}
        </View>
      </View>

      <FlatList
        data={unscheduledSteps}
        renderItem={renderStepCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No steps yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first step</Text>
          </View>
        }
      />

      <ScheduleModal
        visible={scheduleVisible}
        onClose={() => { setScheduleVisible(false); setScheduleStep(null); }}
        onSave={handleScheduleSave}
        initialDate={scheduleStep?.scheduledAt}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={addModalVisible} animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Step</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Step Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Learn Variables"
                placeholderTextColor={colors.text.muted}
                value={stepTitle}
                onChangeText={setStepTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what you need to learn"
                placeholderTextColor={colors.text.muted}
                value={stepDesc}
                onChangeText={setStepDesc}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Resources</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Comma-separated: video link, tutorial, book"
                placeholderTextColor={colors.text.muted}
                value={stepResources}
                onChangeText={setStepResources}
                multiline
              />
            </View>

            <TouchableOpacity style={styles.addStepBtn} onPress={handleAddStep}>
              <Text style={styles.addStepBtnText}>Add Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  languageHeader: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  langIcon: {
    fontSize: 28,
  },
  langInfo: {
    flex: 1,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  langName: {
    ...typography.h2,
  },
  langMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingLeft: 72,
  },
  stepCount: {
    ...typography.caption,
    fontWeight: '600',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardCompleted: {
    opacity: 0.75,
  },
  cardRow: {
    flexDirection: 'row',
  },
  checkboxTouch: {
    marginRight: spacing.md,
    paddingTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 13,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  stepTitle: {
    ...typography.h3,
    fontSize: 16,
    flex: 1,
  },
  stepTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  stepDesc: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  scheduledText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  resourcesWrap: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: spacing.sm,
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
  resourceItem: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
  },
  scheduleBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  scheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  fabText: {
    color: colors.text.inverse,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalBody: {
    paddingHorizontal: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addStepBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  addStepBtnText: {
    ...typography.button,
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
