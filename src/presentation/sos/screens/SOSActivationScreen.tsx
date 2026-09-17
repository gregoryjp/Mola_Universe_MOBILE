import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { SosEventStatus } from '@domain/sos/entities/Sos';
import { Button, Input, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type JSX, useEffect, useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSosHistory, useTrustedContacts } from '../hooks/useSos';
import { type SosLocationStatus, useSosLocation } from '../hooks/useSosLocation';
import { useActivateSos, useCancelSos } from '../hooks/useSosMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'SOSActivation'>;

const STATUS_LABELS: Record<SosEventStatus, string> = {
  PENDING: 'Pendiente de envío',
  SENT: 'Enviada',
  CANCELLED: 'Cancelada',
};

const LOCATION_LABELS: Record<SosLocationStatus, string> = {
  checking: 'Comprobando tu ubicación…',
  ready: 'Tu ubicación se enviará con la alerta',
  permission: 'Sin ubicación: no diste permiso',
  unavailable: 'Sin ubicación: no se pudo obtener',
};

const seconds = (ms: number): number => Math.ceil(ms / 1000);

export const SOSActivationScreen = ({ navigation }: Props): JSX.Element => {
  const contacts = useTrustedContacts();
  const history = useSosHistory();
  const location = useSosLocation();
  const activate = useActivateSos();
  const cancel = useCancelSos();

  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    if (deadline === null) return;
    const tick = (): void => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const contactCount = contacts.data?.length ?? 0;
  const isActive = activeEventId !== null;

  const activateNow = (): void => {
    const trimmed = message.trim();
    const coords = location.coordinates;
    activate.mutate(
      {
        ...(trimmed.length > 0 && { message: trimmed }),
        ...(coords !== null && { locationLat: coords.latitude, locationLng: coords.longitude }),
      },
      {
        onSuccess: (event) => {
          setActiveEventId(event.id);
          setDeadline(Date.now() + event.cancelWindowMs);
        },
      },
    );
  };

  const cancelNow = (): void => {
    if (activeEventId === null) return;
    cancel.mutate(activeEventId, {
      onSuccess: () => {
        setActiveEventId(null);
        setDeadline(null);
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>SOS</Text>

      {contactCount === 0 && !contacts.isLoading ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            No tienes contactos de confianza: nadie recibirá tu alerta.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TrustedContacts')}
            accessibilityRole="button"
            accessibilityLabel="Añadir contactos de confianza"
          >
            <Text style={styles.link}>Añadir contactos</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Input
        value={message}
        onChangeText={setMessage}
        placeholder="Mensaje para tus contactos (opcional)"
        multiline
        readonly={isActive}
        accessibilityLabel="Mensaje para tus contactos"
        testID="sos-message"
      />

      <View style={styles.locationRow} testID="sos-location">
        <Text style={styles.locationText}>{LOCATION_LABELS[location.status]}</Text>
        {location.coordinates !== null ? (
          <Text style={styles.meta}>
            {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
          </Text>
        ) : null}
        {location.status === 'permission' ? (
          <TouchableOpacity
            onPress={() => void Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Abrir los ajustes para permitir el acceso a la ubicación"
          >
            <Text style={styles.link}>Permitir en ajustes</Text>
          </TouchableOpacity>
        ) : null}
        {location.status === 'unavailable' ? (
          <TouchableOpacity
            onPress={location.enable}
            accessibilityRole="button"
            accessibilityLabel="Reintentar obtener mi ubicación"
          >
            <Text style={styles.link}>Reintentar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isActive ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeTitle}>Alerta activada</Text>
          <Text style={styles.activeTime}>
            {remainingMs > 0
              ? `Puedes cancelarla durante ${seconds(remainingMs)} s más`
              : 'La ventana de cancelación ha terminado'}
          </Text>
          <Button
            label="Cancelar alerta"
            variant="secondary"
            size="lg"
            onPress={cancelNow}
            loading={cancel.isPending}
            accessibilityHint="Cancela la alerta SOS activada"
            testID="sos-cancel"
          />
          {cancel.isError ? <Text style={styles.error}>{cancel.error.message}</Text> : null}
        </View>
      ) : (
        <Button
          label="ACTIVAR SOS"
          variant="danger"
          size="lg"
          onPress={activateNow}
          loading={activate.isPending}
          accessibilityHint="Activa la alerta SOS y avisa a tus contactos de confianza"
          testID="sos-activate"
        />
      )}

      {activate.isError ? <Text style={styles.error}>{activate.error.message}</Text> : null}
      {activate.data ? (
        <Text style={styles.muted}>
          {contactCount > 0
            ? `Se avisará a ${contactCount} contacto(s) de confianza`
            : 'Aviso registrado, pero no hay contactos que puedan recibirlo'}
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial</Text>
        {history.isLoading ? <Spinner /> : null}
        {history.isError ? <Text style={styles.error}>{history.error.message}</Text> : null}
        {(history.data ?? []).map((event) => (
          <View key={event.id} style={styles.historyRow}>
            <Text style={styles.historyStatus}>{STATUS_LABELS[event.status]}</Text>
            <Text style={styles.meta}>{new Date(event.activatedAt).toLocaleString()}</Text>
            {event.message ? <Text style={styles.meta}>{event.message}</Text> : null}
          </View>
        ))}
        {history.data && history.data.length === 0 ? (
          <Text style={styles.muted}>Sin activaciones registradas</Text>
        ) : null}
      </View>
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
  warningBox: {
    backgroundColor: theme.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  warningText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  link: {
    ...typography.bodySmall,
    color: theme.primary,
    paddingVertical: spacing.s2,
  },
  locationRow: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  locationText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  activeBox: {
    backgroundColor: theme.errorSoft,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  activeTitle: {
    ...typography.body,
    color: theme.error,
  },
  activeTime: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  section: {
    gap: spacing.s1,
    marginTop: spacing.s2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  muted: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  historyRow: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  historyStatus: {
    ...typography.body,
    color: theme.text,
  },
});
