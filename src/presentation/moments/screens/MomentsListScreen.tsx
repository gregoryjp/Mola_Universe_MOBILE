import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { MomentCard } from '../components/MomentCard';
import { useMoments } from '../hooks/useMoments';

type Props = NativeStackScreenProps<RootStackParamList, 'Moments'>;

export const MomentsListScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const moments = useMoments();
  const styles = useThemedStyles(makeStyles);

  const items = moments.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Momentos</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus momentos</Text>
      ) : null}

      <View style={styles.section}>
        {moments.isLoading ? <Spinner /> : null}
        {moments.isError ? <Text style={styles.error}>{moments.error.message}</Text> : null}

        {items.map((moment) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            onPress={() => navigation.navigate('MomentDetail', { momentId: moment.id })}
          />
        ))}

        {moments.data && items.length === 0 && householdId !== null ? (
          <EmptyState title="Todavía no hay momentos" />
        ) : null}
      </View>

      <Button
        label="+ Nuevo momento"
        onPress={() => navigation.navigate('MomentForm', {})}
        size="lg"
        accessibilityHint="Abre el formulario para crear una quedada o una encuesta"
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
    gap: spacing.s4,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s3,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
