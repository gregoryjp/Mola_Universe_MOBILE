import { colors, spacing, typography } from '@core/theme';
import type { TrustedContact } from '@domain/sos/entities/Sos';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  contact: TrustedContact;
  onDelete: () => void;
}

export const TrustedContactRow = ({ contact, onDelete }: Props): JSX.Element => (
  <View style={styles.row}>
    <View style={styles.header}>
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={contact.verified ? styles.verified : styles.pending}>
        {contact.verified ? 'Verificado' : 'Sin verificar'}
      </Text>
    </View>
    <Text style={styles.meta}>{contact.email}</Text>
    {contact.phone ? <Text style={styles.meta}>{contact.phone}</Text> : null}
    <Text style={styles.meta}>
      {contact.isMolaUser && contact.pushEnabled
        ? 'Recibe avisos push'
        : 'Recibe la alerta por email'}
    </Text>
    <TouchableOpacity onPress={onDelete} accessibilityRole="button">
      <Text style={styles.delete}>Eliminar contacto</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.body,
    color: colors.text,
  },
  verified: {
    ...typography.caption,
    color: colors.success,
  },
  pending: {
    ...typography.caption,
    color: colors.warning,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  delete: {
    ...typography.caption,
    color: colors.error,
  },
});
