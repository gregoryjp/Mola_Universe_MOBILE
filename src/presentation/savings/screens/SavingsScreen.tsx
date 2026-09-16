import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SavingsGoalRow } from '../components/SavingsGoalRow';
import { useHouseholdSavingsGoals, usePersonalSavingsGoals } from '../hooks/useSavingsGoals';

type Props = NativeStackScreenProps<RootStackParamList, 'Savings'>;

export const SavingsScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const householdGoals = useHouseholdSavingsGoals();
  const personalGoals = usePersonalSavingsGoals();

  const goals = householdGoals.data?.goals ?? [];
  const personal = personalGoals.data?.goals ?? [];

  const openGoal = (goalId: string): void => navigation.navigate('SavingsGoalDetail', { goalId });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Ahorros</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus metas de ahorro</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Del hogar</Text>
        {householdGoals.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {householdGoals.isError ? (
          <Text style={styles.error}>{householdGoals.error.message}</Text>
        ) : null}
        {goals.map((goal) => (
          <SavingsGoalRow key={goal.id} goal={goal} onPress={() => openGoal(goal.id)} />
        ))}
        {householdGoals.data && goals.length === 0 && householdId !== null ? (
          <Text style={styles.muted}>Sin metas de hogar todavía</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personales</Text>
        {personalGoals.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {personalGoals.isError ? (
          <Text style={styles.error}>{personalGoals.error.message}</Text>
        ) : null}
        {personal.map((goal) => (
          <SavingsGoalRow key={goal.id} goal={goal} onPress={() => openGoal(goal.id)} />
        ))}
        {personalGoals.data && personal.length === 0 ? (
          <Text style={styles.muted}>Sin metas personales todavía</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SavingsGoalForm')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>+ Nueva meta de ahorro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
