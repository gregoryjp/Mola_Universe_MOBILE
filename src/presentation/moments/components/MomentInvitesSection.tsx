import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { InviteStatus } from '@domain/moments/entities/Moment';
import { Badge, Button, EmptyState, Input, Spinner } from '@presentation/components/ui';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useCreateMomentExternalInvite } from '../hooks/useMomentMutations';
import { useMomentExternalInvites } from '../hooks/useMoments';

const STATUS_LABEL: Record<InviteStatus, string> = {
  INVITED: 'Invitado',
  ACCEPTED: 'Asistirá',
  DECLINED: 'No asistirá',
};

const STATUS_VARIANT: Record<InviteStatus, 'default' | 'success' | 'error'> = {
  INVITED: 'default',
  ACCEPTED: 'success',
  DECLINED: 'error',
};

interface Props {
  momentId: string;
  /** Only the creator can invite; the backend rejects anyone else with 403. */
  canInvite: boolean;
}

export const MomentInvitesSection = ({ momentId, canInvite }: Props): JSX.Element => {
  const invites = useMomentExternalInvites(momentId);
  const createInvite = useCreateMomentExternalInvite(momentId);
  const styles = useThemedStyles(makeStyles);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const canSubmit = email.length > 0 && !createInvite.isPending;

  const handleInvite = (): void => {
    if (!canSubmit) return;
    createInvite.mutate(
      { email, ...(name.length > 0 && { name }) },
      {
        onSuccess: () => {
          setEmail('');
          setName('');
        },
      },
    );
  };

  const items = invites.data ?? [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Invitados externos</Text>
      <Text style={styles.hint}>
        Reciben un correo con un enlace para responder. La respuesta se registra en esa página web,
        no dentro de la app.
      </Text>

      {invites.isLoading ? <Spinner /> : null}
      {invites.isError ? <Text style={styles.error}>{invites.error.message}</Text> : null}

      {items.map((invite) => (
        <View key={invite.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{invite.name ?? invite.email}</Text>
            {invite.name ? <Text style={styles.rowMeta}>{invite.email}</Text> : null}
          </View>
          <Badge label={STATUS_LABEL[invite.status]} variant={STATUS_VARIANT[invite.status]} />
        </View>
      ))}

      {invites.data && items.length === 0 ? (
        <EmptyState title="Todavía no hay invitados externos" />
      ) : null}

      {canInvite ? (
        <View style={styles.form}>
          <Input
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            type="email"
            testID="moment-invite-email"
          />
          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Nombre (opcional)"
            testID="moment-invite-name"
          />
          {createInvite.isError ? (
            <Text style={styles.error}>{createInvite.error.message}</Text>
          ) : null}
          <Button
            label="Invitar"
            onPress={handleInvite}
            disabled={!canSubmit}
            loading={createInvite.isPending}
            size="lg"
            accessibilityHint="Envía una invitación por correo a esta persona"
            testID="moment-invite-submit"
          />
        </View>
      ) : (
        <Text style={styles.hint}>Solo quien creó el momento puede invitar.</Text>
      )}
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  section: {
    gap: spacing.s2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    gap: spacing.s2,
  },
  rowText: {
    flexShrink: 1,
  },
  rowTitle: {
    ...typography.body,
    color: theme.text,
  },
  rowMeta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  form: {
    gap: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
