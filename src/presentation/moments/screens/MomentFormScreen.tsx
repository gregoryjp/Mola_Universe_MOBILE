import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { MomentType } from '@domain/moments/entities/Moment';
import { Button, Input, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCreateMoment, useUpdateMoment } from '../hooks/useMomentMutations';
import { useMoment } from '../hooks/useMoments';

type Props = NativeStackScreenProps<RootStackParamList, 'MomentForm'>;

const MOMENT_TYPES: readonly { value: MomentType; label: string }[] = [
  { value: 'EVENT', label: 'Quedada' },
  { value: 'POLL', label: 'Encuesta' },
];

export const MomentFormScreen = ({ route, navigation }: Props): JSX.Element => {
  const momentId = route.params?.momentId;
  const isEdit = momentId !== undefined;

  const existing = useMoment(momentId ?? '');
  const create = useCreateMoment();
  const update = useUpdateMoment(momentId ?? '');

  const [type, setType] = useState<MomentType>('EVENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detail, setDetail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    const moment = existing.data;
    if (!moment) return;
    setType(moment.type);
    setTitle(moment.title);
    setDescription(moment.description ?? '');
    setDetail(moment.detail ?? '');
    setEventDate(moment.eventDate ?? '');
  }, [existing.data]);

  const mutation = isEdit ? update : create;
  const canSubmit = title.length > 0 && !mutation.isPending;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    const done = (): void => navigation.goBack();

    if (isEdit) {
      update.mutate(
        {
          title,
          ...(description.length > 0 && { description }),
          ...(detail.length > 0 && { detail }),
          ...(eventDate.length > 0 && { eventDate }),
        },
        { onSuccess: done },
      );
      return;
    }

    create.mutate(
      {
        type,
        title,
        ...(description.length > 0 && { description }),
        ...(detail.length > 0 && { detail }),
        ...(eventDate.length > 0 && { eventDate }),
      },
      { onSuccess: done },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title={isEdit ? 'Editar momento' : 'Nuevo momento'}
        onBack={() => navigation.goBack()}
        testID="moment-form-header"
      />
      <Input
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        required
        testID="moment-title"
      />

      {isEdit ? (
        <Text style={styles.hint}>
          Tipo: {type === 'EVENT' ? 'Quedada' : 'Encuesta'} (no modificable al editar)
        </Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.chips}>
            {MOMENT_TYPES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, type === option.value ? styles.chipActive : null]}
                onPress={() => setType(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: type === option.value }}
                accessibilityLabel={`Tipo ${option.label}`}
                testID={`moment-type-${option.value}`}
              >
                <Text
                  style={[styles.chipText, type === option.value ? styles.chipTextActive : null]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción (opcional)"
        multiline
        testID="moment-description"
      />
      <Input
        label="Detalles"
        value={detail}
        onChangeText={setDetail}
        placeholder="Detalles (opcional: qué llevar, dónde quedar…)"
        multiline
        testID="moment-detail"
      />

      <Input
        label="Fecha"
        value={eventDate}
        onChangeText={setEventDate}
        placeholder="Fecha (opcional, ISO: 2026-09-20T18:00:00Z)"
        autoCapitalize="none"
        testID="moment-event-date"
      />
      {type === 'EVENT' ? (
        <Text style={styles.hint}>
          Una quedada con fecha se añade también al calendario del hogar.
        </Text>
      ) : null}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <Button
        label={isEdit ? 'Guardar cambios' : 'Crear momento'}
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={mutation.isPending}
        size="lg"
        accessibilityHint={
          isEdit ? 'Guarda los cambios del momento' : 'Crea el momento con los datos introducidos'
        }
        testID="moment-submit"
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
