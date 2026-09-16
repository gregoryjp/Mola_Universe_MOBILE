import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useCalendarEvent } from '../hooks/useCalendarEvents';
import { useDeleteCalendarEvent } from '../hooks/useCalendarMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarEventDetail'>;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const CalendarEventDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { eventId } = route.params;
  const event = useCalendarEvent(eventId);
  const remove = useDeleteCalendarEvent();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{event.data?.title ?? 'Evento'}</Text>

      {event.isLoading ? <Spinner /> : null}
      {event.isError ? <Text style={styles.error}>{event.error.message}</Text> : null}

      {event.data ? (
        <View style={styles.block}>
          <Text style={styles.row}>
            <Text style={styles.label}>Tipo: </Text>
            {event.data.type}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Alcance: </Text>
            {event.data.scope === 'HOUSEHOLD' ? 'Hogar' : 'Personal'}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Inicio: </Text>
            {formatDate(event.data.startAt)}
          </Text>
          {event.data.endAt ? (
            <Text style={styles.row}>
              <Text style={styles.label}>Fin: </Text>
              {formatDate(event.data.endAt)}
            </Text>
          ) : null}
          <Text style={styles.row}>
            <Text style={styles.label}>Zona: </Text>
            {event.data.timezone}
          </Text>
          {event.data.description ? (
            <Text style={styles.description}>{event.data.description}</Text>
          ) : null}
        </View>
      ) : null}

      <Button
        label="Editar"
        onPress={() => navigation.navigate('CalendarEventForm', { eventId })}
        size="lg"
        accessibilityHint="Abre el formulario para editar este evento"
      />

      {remove.isError ? <Text style={styles.error}>{remove.error.message}</Text> : null}
      <Button
        label="Eliminar evento"
        onPress={() => remove.mutate(eventId, { onSuccess: () => navigation.goBack() })}
        loading={remove.isPending}
        variant="danger"
        size="lg"
        accessibilityHint="Elimina este evento definitivamente"
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
  block: {
    gap: spacing.s1,
  },
  row: {
    ...typography.body,
    color: theme.text,
  },
  label: {
    color: theme.textMuted,
  },
  description: {
    ...typography.body,
    color: theme.textMuted,
    marginTop: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
