import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { SosEventStatus } from '@domain/sos/entities/Sos';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type JSX, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSosHistory, useTrustedContacts } from '../hooks/useSos';
import { useActivateSos, useCancelSos } from '../hooks/useSosMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'SOSActivation'>;

const STATUS_LABELS: Record<SosEventStatus, string> = {
  PENDING: 'Pendiente de envío',
  SENT: 'Enviada',
  CANCELLED: 'Cancelada',
};

const seconds = (ms: number): number => Math.ceil(ms / 1000);

export const SOSActivationScreen = ({ navigation }: Props): JSX.Element => {
  const contacts = useTrustedContacts();
  const history = useSosHistory();
  const activate = useActivateSos();
  const cancel = useCancelSos();

  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

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
    activate.mutate(
      { ...(trimmed.length > 0 && { message: trimmed }) },
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
          >
            <Text style={styles.link}>Añadir contactos</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Mensaje para tus contactos (opcional)"
        placeholderTextColor={colors.textMuted}
        value={message}
        onChangeText={setMessage}
        editable={!isActive}
        multiline
      />

      {isActive ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeTitle}>Alerta activada</Text>
          <Text style={styles.activeTime}>
            {remainingMs > 0
              ? `Puedes cancelarla durante ${seconds(remainingMs)} s más`
              : 'La ventana de cancelación ha terminado'}
          </Text>
          <TouchableOpacity
            style={[styles.cancelButton, cancel.isPending ? styles.buttonDisabled : null]}
            disabled={cancel.isPending}
            onPress={cancelNow}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>
              {cancel.isPending ? 'Cancelando…' : 'Cancelar alerta'}
            </Text>
          </TouchableOpacity>
          {cancel.isError ? <Text style={styles.error}>{cancel.error.message}</Text> : null}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.sosButton, activate.isPending ? styles.buttonDisabled : null]}
          disabled={activate.isPending}
          onPress={activateNow}
          accessibilityRole="button"
        >
          <Text style={styles.sosText}>{activate.isPending ? 'Activando…' : 'ACTIVAR SOS'}</Text>
        </TouchableOpacity>
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
        {history.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
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
  warningBox: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
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
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sosButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  sosText: {
    ...typography.h3,
    color: colors.text,
  },
  activeBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  activeTitle: {
    ...typography.h3,
    color: colors.error,
  },
  activeTime: {
    ...typography.body,
    color: colors.text,
  },
  cancelButton: {
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    color: colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  muted: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  historyRow: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  historyStatus: {
    ...typography.body,
    color: colors.text,
  },
});
