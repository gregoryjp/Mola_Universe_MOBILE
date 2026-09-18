import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Badge, Button, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { MomentInvitesSection } from '../components/MomentInvitesSection';
import { RsvpSection } from '../components/RsvpSection';
import { useDeleteMoment, useRespondToMoment, useUpdateMoment } from '../hooks/useMomentMutations';
import { useMoment } from '../hooks/useMoments';

type Props = NativeStackScreenProps<RootStackParamList, 'MomentDetail'>;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const MomentDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { momentId } = route.params;
  const moment = useMoment(momentId);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);

  const rsvp = useRespondToMoment(momentId);
  const update = useUpdateMoment(momentId);
  const remove = useDeleteMoment();
  const styles = useThemedStyles(makeStyles);

  const data = moment.data;
  const isCreator =
    data !== undefined && currentUserId !== null && data.createdBy === currentUserId;
  const isCancelled = data?.status === 'CANCELLED';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ScreenHeader
          title={data?.title ?? 'Momento'}
          onBack={() => navigation.goBack()}
          testID="moment-detail-header"
        />
        {data ? (
          <Badge
            label={isCancelled ? 'Cancelado' : data.type === 'EVENT' ? 'Quedada' : 'Encuesta'}
            variant={isCancelled ? 'error' : 'info'}
          />
        ) : null}
      </View>

      {moment.isLoading ? <Spinner /> : null}
      {moment.isError ? <Text style={styles.error}>{moment.error.message}</Text> : null}

      {data ? (
        <View style={styles.block}>
          {data.eventDate ? (
            <Text style={styles.row}>
              <Text style={styles.label}>Fecha: </Text>
              {formatDate(data.eventDate)}
            </Text>
          ) : null}
          {data.description ? <Text style={styles.body}>{data.description}</Text> : null}
          {data.detail ? <Text style={styles.muted}>{data.detail}</Text> : null}
        </View>
      ) : null}

      {data?.calendarEventId ? (
        <Button
          label="Ver en el calendario"
          onPress={() =>
            navigation.navigate('CalendarEventDetail', { eventId: data.calendarEventId ?? '' })
          }
          variant="secondary"
          size="lg"
          accessibilityHint="Abre el evento del calendario vinculado a este momento"
          testID="moment-calendar-link"
        />
      ) : null}

      {isCancelled ? (
        <Text style={styles.muted}>
          Este momento está cancelado. La asistencia queda cerrada, pero puedes seguir consultando
          sus datos.
        </Text>
      ) : null}

      {data && !isCancelled ? (
        <RsvpSection
          participants={data.participants}
          currentUserId={currentUserId}
          onRespond={(response) => rsvp.mutate(response)}
          isPending={rsvp.isPending}
          disabled={false}
        />
      ) : null}

      {rsvp.isError ? <Text style={styles.error}>{rsvp.error.message}</Text> : null}

      {data ? <MomentInvitesSection momentId={momentId} canInvite={isCreator} /> : null}

      {data?.type === 'EVENT' ? (
        <View style={styles.block}>
          <Text style={styles.label}>Zona de juegos</Text>
          <Text style={styles.muted}>
            Este es el espacio reservado para los juegos de la quedada. Todavía no hay ninguno: el
            motor de juegos llega con la fase de backend 3b.
          </Text>
        </View>
      ) : null}

      {isCreator ? (
        <View style={styles.actions}>
          <Button
            label="Editar"
            onPress={() => navigation.navigate('MomentForm', { momentId })}
            size="lg"
            accessibilityHint="Abre el formulario para editar este momento"
            testID="moment-edit"
          />
          {!isCancelled ? (
            <Button
              label="Cancelar momento"
              onPress={() => update.mutate({ status: 'CANCELLED' })}
              loading={update.isPending}
              variant="secondary"
              size="lg"
              accessibilityHint="Marca este momento como cancelado sin borrarlo"
              testID="moment-cancel"
            />
          ) : null}
          <Button
            label="Eliminar momento"
            onPress={() => remove.mutate(momentId, { onSuccess: () => navigation.goBack() })}
            loading={remove.isPending}
            variant="danger"
            size="lg"
            accessibilityHint="Elimina este momento definitivamente"
            testID="moment-delete"
          />
        </View>
      ) : (
        <Text style={styles.muted}>
          Solo quien creó el momento puede editarlo, cancelarlo o eliminarlo.
        </Text>
      )}

      {update.isError ? <Text style={styles.error}>{update.error.message}</Text> : null}
      {remove.isError ? <Text style={styles.error}>{remove.error.message}</Text> : null}
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
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s2,
  },
  block: {
    gap: spacing.s1,
  },
  row: {
    ...typography.body,
    color: theme.text,
  },
  label: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  body: {
    ...typography.body,
    color: theme.text,
  },
  muted: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  actions: {
    gap: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
