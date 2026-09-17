import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { MeowCapability, MeowCapabilityParams } from '@domain/meow/entities/Meow';
import { Card, ErrorState } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CAPABILITY_GROUP_LABELS, type CapabilityGroup, capabilitiesOf } from '../capabilities';
import { CapabilityCard } from '../components/CapabilityCard';
import { CapabilityForm } from '../components/CapabilityForm';
import { useMeowCapability } from '../hooks/useMeowCapability';

type Props = NativeStackScreenProps<RootStackParamList, 'Meow'>;

const GROUPS: CapabilityGroup[] = ['READ', 'WRITE', 'PREMIUM'];

/**
 * Meow: the 12 structured capabilities, one card each. Deliberately not a chat —
 * there is no free-text input and no history, per the product decision. Every
 * action is a typed call to `POST /meow/capabilities/:capability`, so running one
 * costs zero tokens and returns a deterministic confirmation.
 */
export const MeowScreen = (_props: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const [selected, setSelected] = useState<MeowCapability | null>(null);
  const execute = useMeowCapability();
  const styles = useThemedStyles(makeStyles);

  const toggle = (capability: MeowCapability): void => {
    execute.reset();
    setSelected((current) => (current === capability ? null : capability));
  };

  const run = (capability: MeowCapability, params: MeowCapabilityParams): void => {
    execute.mutate({ capability, params });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Meow</Text>
      <Text style={styles.subtitle}>
        12 acciones concretas. Eliges la acción y Meow la ejecuta: sin chat libre y sin historial.
      </Text>
      <HouseholdSelector />

      {GROUPS.map((group) => (
        <View key={group} style={styles.section}>
          <Text style={styles.sectionTitle}>{CAPABILITY_GROUP_LABELS[group]}</Text>
          {capabilitiesOf(group).map((meta) => {
            const blocked = meta.requiresHousehold && householdId === null;
            const expanded = selected === meta.id;
            return (
              <View key={meta.id} style={styles.block}>
                <CapabilityCard
                  meta={meta}
                  expanded={expanded}
                  disabled={blocked}
                  onPress={() => toggle(meta.id)}
                />
                {expanded && !blocked ? (
                  <>
                    <CapabilityForm
                      meta={meta}
                      isSubmitting={execute.isPending}
                      onSubmit={(params) => run(meta.id, params)}
                    />
                    {execute.isError && selected === meta.id ? (
                      <ErrorState message={execute.error.message} testID="meow-error" />
                    ) : null}
                    {execute.isSuccess && execute.data.capability === meta.id ? (
                      <Card variant="pastel" tone="success" size="sm" testID="meow-result">
                        <View style={styles.result}>
                          <Text style={styles.resultMessage}>{execute.data.message}</Text>
                          {execute.data.phrase ? (
                            <Text style={styles.resultPhrase}>{execute.data.phrase}</Text>
                          ) : null}
                        </View>
                      </Card>
                    ) : null}
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}

      <Text style={styles.footer}>
        Meow no genera texto libre con IA en este camino. Las capabilities se ejecutan con params
        tipados y responden con una frase determinista.
      </Text>
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
    gap: spacing.s4,
    paddingBottom: spacing.s12,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  subtitle: {
    ...typography.body,
    color: theme.textMuted,
  },
  section: {
    gap: spacing.s2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  block: {
    gap: spacing.s2,
  },
  result: {
    gap: spacing.s1,
  },
  resultMessage: {
    ...typography.body,
    color: theme.text,
  },
  resultPhrase: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  footer: {
    ...typography.caption,
    color: theme.textMuted,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderRadius: radius.sm,
    paddingTop: spacing.s3,
  },
});
