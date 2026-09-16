import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { CalendarEventType } from '@domain/calendar/entities/CalendarEvent';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCalendarEvent } from '../hooks/useCalendarEvents';
import { useCreateCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendarMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarEventForm'>;

const EVENT_TYPES: CalendarEventType[] = [
  'GENERAL',
  'BIRTHDAY',
  'APPOINTMENT',
  'PAYMENT',
  'SUBSCRIPTION',
  'INSURANCE',
  'MAINTENANCE',
  'PET',
  'TRIP',
  'CUSTOM',
];

export const CalendarEventFormScreen = ({ route, navigation }: Props): JSX.Element => {
  const eventId = route.params?.eventId;
  const isEdit = eventId !== undefined;
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const existing = useCalendarEvent(eventId ?? '');
  const create = useCreateCalendarEvent();
  const update = useUpdateCalendarEvent(eventId ?? '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('GENERAL');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isHousehold, setIsHousehold] = useState(householdId !== null);
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    const event = existing.data;
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description ?? '');
    setType(event.type);
    setStartAt(event.startAt);
    setEndAt(event.endAt ?? '');
    setTimezone(event.timezone);
    setIsHousehold(event.scope === 'HOUSEHOLD');
  }, [existing.data]);

  const mutation = isEdit ? update : create;
  const canSubmit = title.length > 0 && startAt.length > 0 && !mutation.isPending;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    const shared = {
      ...(description.length > 0 && { description }),
      type,
      startAt,
      ...(timezone.length > 0 && { timezone }),
    };

    const done = (): void => navigation.goBack();

    if (isEdit) {
      update.mutate(
        {
          title,
          ...shared,
          ...(endAt.length > 0 ? { endAt } : { endAt: null }),
        },
        { onSuccess: done },
      );
      return;
    }

    create.mutate(
      {
        scope: isHousehold ? 'HOUSEHOLD' : 'PERSONAL',
        input: {
          title,
          ...shared,
          ...(endAt.length > 0 && { endAt }),
        },
      },
      { onSuccess: done },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{isEdit ? 'Editar evento' : 'Nuevo evento'}</Text>

      <Input
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        required
        testID="calendar-event-title"
      />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción (opcional)"
        multiline
        testID="calendar-event-description"
      />

      <Text style={styles.sectionTitle}>Tipo</Text>
      <View style={styles.chips}>
        {EVENT_TYPES.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, type === option ? styles.chipActive : null]}
            onPress={() => setType(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: type === option }}
            accessibilityLabel={`Tipo ${option}`}
          >
            <Text style={[styles.chipText, type === option ? styles.chipTextActive : null]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Inicio"
        value={startAt}
        onChangeText={setStartAt}
        placeholder="Inicio (ISO, ej. 2026-09-20T18:00:00Z)"
        autoCapitalize="none"
        required
        testID="calendar-event-start"
      />
      <Input
        label="Fin"
        value={endAt}
        onChangeText={setEndAt}
        placeholder="Fin (opcional)"
        autoCapitalize="none"
        testID="calendar-event-end"
      />
      <Input
        label="Zona horaria"
        value={timezone}
        onChangeText={setTimezone}
        placeholder="Zona horaria (opcional, ej. Europe/Madrid)"
        autoCapitalize="none"
        testID="calendar-event-timezone"
      />

      {isEdit ? (
        <Text style={styles.hint}>
          Alcance: {isHousehold ? 'Hogar' : 'Personal'} (no modificable al editar)
        </Text>
      ) : (
        <>
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
              <Text style={[styles.chipText, isHousehold ? styles.chipTextActive : null]}>
                Hogar
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <Button
        label={isEdit ? 'Guardar cambios' : 'Crear evento'}
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={mutation.isPending}
        size="lg"
        accessibilityHint={
          isEdit ? 'Guarda los cambios del evento' : 'Crea el evento con los datos introducidos'
        }
        testID="calendar-event-submit"
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
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
