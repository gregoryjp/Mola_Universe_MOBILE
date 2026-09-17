import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { TrustedContact } from '@domain/sos/entities/Sos';
import { Badge } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  contact: TrustedContact;
  onDelete: () => void;
  onResendInvite: () => void;
  isResending?: boolean;
}

export const TrustedContactRow = ({
  contact,
  onDelete,
  onResendInvite,
  isResending = false,
}: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.name}>{contact.name}</Text>
        <Badge label={contact.verified ? 'Verificado' : 'Sin verificar'} />
      </View>
      <Text style={styles.meta}>{contact.email}</Text>
      {contact.phone ? <Text style={styles.meta}>{contact.phone}</Text> : null}
      {!contact.verified ? (
        <Text style={styles.pending}>
          No recibirá tus alertas SOS hasta que acepte la invitación que le enviamos por correo.
          Puedes reenviarla si no la vio o si ha caducado; si el correo es incorrecto, elimínalo y
          créalo de nuevo.
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {!contact.verified
          ? 'Sin verificar: no recibe avisos'
          : contact.isMolaUser && contact.pushEnabled
            ? 'Recibe avisos push'
            : 'Recibe la alerta por email'}
      </Text>
      {!contact.verified ? (
        <TouchableOpacity
          onPress={onResendInvite}
          disabled={isResending}
          accessibilityRole="button"
          accessibilityState={{ disabled: isResending }}
          accessibilityLabel={`Reenviar la invitación a ${contact.name}`}
          accessibilityHint="Vuelve a enviar el correo de verificación a este contacto"
          testID={`contact-${contact.id}-resend`}
        >
          <Text style={[styles.action, isResending && styles.actionDisabled]}>
            {isResending ? 'Reenviando…' : 'Reenviar invitación'}
          </Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar contacto ${contact.name}`}
      >
        <Text style={styles.delete}>Eliminar contacto</Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  name: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  pending: {
    ...typography.caption,
    color: theme.text,
  },
  action: {
    ...typography.caption,
    color: theme.text,
    textDecorationLine: 'underline' as const,
    paddingVertical: spacing.s2,
  },
  actionDisabled: {
    color: theme.textMuted,
    textDecorationLine: 'none' as const,
  },
  delete: {
    ...typography.caption,
    color: theme.error,
    paddingVertical: spacing.s2,
  },
});
