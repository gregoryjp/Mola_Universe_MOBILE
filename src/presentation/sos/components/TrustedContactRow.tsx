import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { TrustedContact } from '@domain/sos/entities/Sos';
import { Badge } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  contact: TrustedContact;
  onDelete: () => void;
}

export const TrustedContactRow = ({ contact, onDelete }: Props): JSX.Element => {
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
          No recibirá tus alertas SOS hasta que acepte la invitación que le enviamos por correo. Si
          el correo es incorrecto, elimínalo y créalo de nuevo.
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {!contact.verified
          ? 'Sin verificar: no recibe avisos'
          : contact.isMolaUser && contact.pushEnabled
            ? 'Recibe avisos push'
            : 'Recibe la alerta por email'}
      </Text>
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
  delete: {
    ...typography.caption,
    color: theme.error,
    paddingVertical: spacing.s2,
  },
});
