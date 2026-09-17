import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { Moment } from '@domain/moments/entities/Moment';
import { Badge, Card } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, View } from 'react-native';

const TYPE_LABEL: Record<Moment['type'], string> = {
  EVENT: 'Quedada',
  POLL: 'Encuesta',
};

const formatEventDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

interface Props {
  moment: Moment;
  onPress: () => void;
}

export const MomentCard = ({ moment, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Card variant="interactive" onPress={onPress} accessibilityLabel={moment.title}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {moment.title}
        </Text>
        {moment.status === 'CANCELLED' ? (
          <Badge label="Cancelado" variant="error" size="sm" />
        ) : null}
      </View>

      <Text style={styles.meta}>
        {TYPE_LABEL[moment.type]}
        {moment.eventDate ? ` · ${formatEventDate(moment.eventDate)}` : ''}
      </Text>

      {moment.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {moment.description}
        </Text>
      ) : null}
    </Card>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s2,
  },
  title: {
    ...typography.body,
    color: theme.text,
    flexShrink: 1,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  description: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
});
