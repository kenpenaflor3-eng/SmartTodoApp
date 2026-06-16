import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../src/context/AuthContext';
import { languagesService, learningStepsService } from '../../src/services/firebaseService';
import { sampleLanguages, getSampleStepsForLanguage } from '../../src/config/sampleData';
import { Language, LearningStep } from '../../src/types';
import { Card, Badge } from '../../src/components';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';

const difficultyConfig: Record<string, { color: string; bg: string }> = {
  beginner: { color: colors.success, bg: colors.successLight },
  intermediate: { color: colors.warning, bg: colors.warningLight },
  advanced: { color: colors.danger, bg: colors.dangerLight },
};

export default function LanguagesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [userSteps, setUserSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLanguageProgress = async () => {
    if (!user) {
      setUserSteps([]);
      return;
    }

    try {
      const data = await learningStepsService.getUserSteps(user.uid);
      setUserSteps(data);
    } catch {
      setUserSteps([]);
    }
  };

  const loadLanguages = async () => {
    setLoading(true);
    try {
      if (!user) {
        setLanguages(sampleLanguages);
        return;
      }
      const data = await languagesService.getUserLanguages(user.uid);
      setLanguages(data.length > 0 ? data : sampleLanguages);
    } catch {
      setLanguages(sampleLanguages);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLanguages();
      loadLanguageProgress();
    }, [user])
  );

  const getLanguageProgress = (languageId: string) => {
    const languageSteps = user ? userSteps.filter((step) => step.languageId === languageId) : getSampleStepsForLanguage(languageId);
    const total = languageSteps.length;
    const completed = languageSteps.filter((step) => step.completed).length;
    return { total, completed };
  };

  const renderLanguageCard = ({ item }: { item: Language }) => {
    const diff = difficultyConfig[item.difficulty] || difficultyConfig.beginner;
    const progress = getLanguageProgress(item.id);
    const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

    return (
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.iconCircle, { backgroundColor: diff.bg }]}> 
            <Text style={styles.cardIcon}>{item.icon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Badge label={item.difficulty} variant={item.difficulty === 'beginner' ? 'success' : item.difficulty === 'intermediate' ? 'warning' : 'danger'} />
          </View>
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.viewStepsButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Steps', { languageId: item.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.viewStepsText}>View Steps →</Text>
          </TouchableOpacity>

          <View style={styles.progressWrap}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {progress.total > 0 ? `${percent}% • ${progress.completed}/${progress.total}` : 'No steps yet'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading && languages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={languages}
        renderItem={renderLanguageCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>No languages available</Text>
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
    paddingBottom: 100,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.body,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  viewStepsButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    ...shadows.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  progressWrap: {
    flex: 1,
    minWidth: 140,
    marginLeft: spacing.md,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.caption,
  },
  viewStepsText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
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
    color: colors.text.muted,
  },
});
