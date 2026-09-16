import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { SavingsBoardPreset } from '@domain/savings/entities/SavingsGoal';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  const styles = useThemedStyles(makeStyles);

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

      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Nombre (ej. Vacaciones)"
        required
        testID="savings-goal-name"
      />
      <Input
        label="Objetivo"
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="Objetivo (ej. 1200.00)"
        keyboardType="decimal-pad"
        required
        testID="savings-goal-target"
      />
      <Input
        label="Moneda"
        value={currency}
        onChangeText={setCurrency}
        placeholder="Moneda (ISO-3, ej. EUR)"
        autoCapitalize="characters"
        maxLength={3}
        testID="savings-goal-currency"
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
            accessibilityLabel={`Tablero ${option}`}
          >
            <Text style={[styles.chipText, preset === option ? styles.chipTextActive : null]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {preset === 'CUSTOM' ? (
        <Input
          label="Denominaciones"
          value={denominations}
          onChangeText={setDenominations}
          placeholder="Denominaciones separadas por coma (ej. 10,20,50)"
          testID="savings-goal-denominations"
        />
      ) : null}

      <Text style={styles.sectionTitle}>Alcance</Text>
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !isHousehold ? styles.chipActive : null]}
          onPress={() => setIsHousehold(false)}
          accessibilityRole="button"
          accessibilityState={{ selected: !isHousehold }}
          accessibilityLabel="Alcance personal"
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
          accessibilityLabel="Alcance hogar"
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
              accessibilityLabel="Aportación libre"
            >
              <Text style={[styles.chipText, !isQuota ? styles.chipTextActive : null]}>Libre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, isQuota ? styles.chipActive : null]}
              onPress={() => setIsQuota(true)}
              accessibilityRole="button"
              accessibilityState={{ selected: isQuota }}
              accessibilityLabel="Aportación por cuota"
            >
              <Text style={[styles.chipText, isQuota ? styles.chipTextActive : null]}>Cuota</Text>
            </TouchableOpacity>
          </View>
          {isQuota ? (
            <Input
              label="Cuota mensual"
              value={quotaAmount}
              onChangeText={setQuotaAmount}
              placeholder="Cuota mensual (ej. 50.00)"
              keyboardType="decimal-pad"
              required
              testID="savings-goal-quota"
            />
          ) : null}
        </>
      ) : null}

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <Button
        label="Crear meta"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={create.isPending}
        size="lg"
        accessibilityHint="Crea la meta de ahorro con la configuración elegida"
        testID="savings-goal-submit"
      />
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s2,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
    marginTop: spacing.s1,
  },
  chips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s1,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s1,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  chipTextActive: {
    color: theme.textInverse,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
