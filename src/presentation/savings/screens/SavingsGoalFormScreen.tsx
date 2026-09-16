import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { SavingsBoardPreset } from '@domain/savings/entities/SavingsGoal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateSavingsGoal } from '../hooks/useSavingsMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'SavingsGoalForm'>;

const PRESETS: SavingsBoardPreset[] = ['SMALL', 'MEDIUM', 'LARGE', 'CUSTOM'];

export const SavingsGoalFormScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const create = useCreateSavingsGoal();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [preset, setPreset] = useState<SavingsBoardPreset>('MEDIUM');
  const [denominations, setDenominations] = useState('');
  const [isHousehold, setIsHousehold] = useState(householdId !== null);
  const [isQuota, setIsQuota] = useState(false);
  const [quotaAmount, setQuotaAmount] = useState('');

  const parsedDenominations = denominations
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const canSubmit =
    name.length > 0 &&
    targetAmount.length > 0 &&
    currency.length === 3 &&
    (!isHousehold || !isQuota || quotaAmount.length > 0) &&
    (preset !== 'CUSTOM' || parsedDenominations.length > 0) &&
    !create.isPending;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    create.mutate(
      {
        scope: isHousehold ? 'HOUSEHOLD' : 'PERSONAL',
        input: {
          name,
          targetAmount,
          currency,
          boardPreset: preset,
          ...(preset === 'CUSTOM' && { denominations: parsedDenominations }),
          ...(isHousehold && { contributionMode: isQuota ? 'QUOTA' : 'FREE' }),
          ...(isHousehold && isQuota && { quotaAmount }),
        },
      },
      { onSuccess: (goal) => navigation.replace('SavingsGoalDetail', { goalId: goal.id }) },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Nueva meta de ahorro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre (ej. Vacaciones)"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Objetivo (ej. 1200.00)"
        placeholderTextColor={colors.textMuted}
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Moneda (ISO-3, ej. EUR)"
        placeholderTextColor={colors.textMuted}
        value={currency}
        onChangeText={setCurrency}
        autoCapitalize="characters"
        maxLength={3}
      />

      <Text style={styles.sectionTitle}>Tablero</Text>
      <View style={styles.chips}>
        {PRESETS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, preset === option ? styles.chipActive : null]}
            onPress={() => setPreset(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: preset === option }}
          >
            <Text style={[styles.chipText, preset === option ? styles.chipTextActive : null]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {preset === 'CUSTOM' ? (
        <TextInput
          style={styles.input}
          placeholder="Denominaciones separadas por coma (ej. 10,20,50)"
          placeholderTextColor={colors.textMuted}
          value={denominations}
          onChangeText={setDenominations}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Alcance</Text>
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !isHousehold ? styles.chipActive : null]}
          onPress={() => setIsHousehold(false)}
          accessibilityRole="button"
          accessibilityState={{ selected: !isHousehold }}
        >
          <Text style={[styles.chipText, !isHousehold ? styles.chipTextActive : null]}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, isHousehold ? styles.chipActive : null]}
          onPress={() => setIsHousehold(true)}
          disabled={householdId === null}
          accessibilityRole="button"
          accessibilityState={{ selected: isHousehold }}
        >
          <Text style={[styles.chipText, isHousehold ? styles.chipTextActive : null]}>Hogar</Text>
        </TouchableOpacity>
      </View>

      {isHousehold ? (
        <>
          <Text style={styles.sectionTitle}>Aportación</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              style={[styles.chip, !isQuota ? styles.chipActive : null]}
              onPress={() => setIsQuota(false)}
              accessibilityRole="button"
              accessibilityState={{ selected: !isQuota }}
            >
              <Text style={[styles.chipText, !isQuota ? styles.chipTextActive : null]}>Libre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, isQuota ? styles.chipActive : null]}
              onPress={() => setIsQuota(true)}
              accessibilityRole="button"
              accessibilityState={{ selected: isQuota }}
            >
              <Text style={[styles.chipText, isQuota ? styles.chipTextActive : null]}>Cuota</Text>
            </TouchableOpacity>
          </View>
          {isQuota ? (
            <TextInput
              style={styles.input}
              placeholder="Cuota mensual (ej. 50.00)"
              placeholderTextColor={colors.textMuted}
              value={quotaAmount}
              onChangeText={setQuotaAmount}
              keyboardType="decimal-pad"
            />
          ) : null}
        </>
      ) : null}

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <TouchableOpacity
        style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{create.isPending ? 'Creando…' : 'Crear meta'}</Text>
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
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.background,
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
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
