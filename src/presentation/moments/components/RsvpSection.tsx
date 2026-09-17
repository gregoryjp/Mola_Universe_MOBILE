import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { MomentParticipant, MomentRsvp } from '@domain/moments/entities/Moment';
import { Button } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, View } from 'react-native';

const RESPONSE_LABEL = {
  GOING: 'Voy',
  NOT_GOING: 'No puedo',
  PENDING: 'Pendiente',
} as const;

interface Props {
  participants: MomentParticipant[];
  currentUserId: string | null;
  onRespond: (response: MomentRsvp) => void;
  isPending: boolean;
  disabled: boolean;
}

/**
 * RSVP for the household members.
 *
 * There is no per-person list on purpose: the backend exposes participants by
 * `userId` only (`IHouseholdMemberDTO` carries no name or email), so rendering
 * them individually would mean printing raw identifiers. The counts plus the
 * caller's own answer say everything the data actually supports today.
 */
export const RsvpSection = ({
  participants,
  currentUserId,
  onRespond,
  isPending,
  disabled,
}: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  const countOf = (response: MomentParticipant['response']): number =>
    participants.filter((participant) => participant.response === response).length;

  const mine = participants.find((participant) => participant.userId === currentUserId);
  const myResponse = mine?.response ?? null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Asistencia</Text>

      <Text style={styles.summary}>
        {countOf('GOING')} van · {countOf('NOT_GOING')} no pueden · {countOf('PENDING')} pendientes
      </Text>

      <Text style={styles.mine}>
        {myResponse === null || myResponse === 'PENDING'
          ? 'Todavía no has respondido'
          : `Tu respuesta: ${RESPONSE_LABEL[myResponse]}`}
      </Text>

      <View style={styles.actions}>
        <Button
          label="Voy"
          onPress={() => onRespond('GOING')}
          variant={myResponse === 'GOING' ? 'primary' : 'secondary'}
          disabled={disabled}
          loading={isPending}
          size="lg"
          style={styles.action}
          accessibilityHint="Confirma tu asistencia a este momento"
          testID="moment-rsvp-going"
        />
        <Button
          label="No puedo"
          onPress={() => onRespond('NOT_GOING')}
          variant={myResponse === 'NOT_GOING' ? 'primary' : 'secondary'}
          disabled={disabled}
          loading={isPending}
          size="lg"
          style={styles.action}
          accessibilityHint="Indica que no puedes asistir a este momento"
          testID="moment-rsvp-not-going"
        />
      </View>
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
  summary: {
    ...typography.body,
    color: theme.text,
  },
  mine: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
  },
  action: {
    flex: 1,
  },
});
