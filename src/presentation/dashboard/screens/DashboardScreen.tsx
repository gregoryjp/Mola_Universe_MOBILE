import type { MainTabParamList, RootStackParamList, TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import { Avatar, Card, ErrorState, IconButton, Spinner } from '@presentation/components/ui';
import { useAuthStore } from '@shared/store/authStore';
import {
  Bell,
  Calendar,
  Cat,
  Image as ImageIcon,
  ListTodo,
  PawPrint,
  PiggyBank,
  ShieldAlert,
  ShoppingCart,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

/** Every real, reachable route this screen can navigate to — spans both the
 * tab navigator (TasksList, ShoppingLists, Calendar) and the root stack
 * (everything pushed on top of it), since Dashboard already links to both. */
type AppRoute = keyof MainTabParamList | keyof RootStackParamList;

type Props = TabScreenProps<'Dashboard'>;

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** No Intl dependency on purpose — avoids relying on Hermes ICU data. */
const formatFriendlyDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
};

const greetingFor = (hour: number): string => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

interface StatTileProps {
  label: string;
  value: number;
  onPress: () => void;
}

const StatTile = ({ label, value, onPress }: StatTileProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Card
      variant="interactive"
      size="sm"
      onPress={onPress}
      accessibilityLabel={`${label}: ${value}`}
      style={styles.stat}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

interface SectionLink {
  key: string;
  label: string;
  icon: ComponentType<IconProps>;
  route: AppRoute;
}

/**
 * Every entry here is a real, already-shipped screen (no placeholder routes) —
 * "En casa" groups day-to-day household use, "Más" groups finance/account/
 * safety, so the former 13-button wall reads as two short, scannable groups
 * instead of one undifferentiated list.
 */
const EN_CASA: SectionLink[] = [
  { key: 'tasks', label: 'Tareas', icon: ListTodo, route: 'TasksList' },
  { key: 'shopping', label: 'Compras', icon: ShoppingCart, route: 'ShoppingLists' },
  { key: 'calendar', label: 'Calendario', icon: Calendar, route: 'Calendar' },
  { key: 'pets', label: 'Mascotas', icon: PawPrint, route: 'Pets' },
  { key: 'moments', label: 'Momentos', icon: ImageIcon, route: 'Moments' },
];

const MAS: SectionLink[] = [
  { key: 'expenses', label: 'Gastos', icon: Wallet, route: 'Expenses' },
  { key: 'savings', label: 'Ahorros', icon: PiggyBank, route: 'Savings' },
  { key: 'sos', label: 'SOS', icon: ShieldAlert, route: 'SOSActivation' },
  { key: 'contacts', label: 'Contactos de confianza', icon: Users, route: 'TrustedContacts' },
  { key: 'account', label: 'Cuenta', icon: User, route: 'Account' },
  { key: 'meow', label: 'Meow', icon: Cat, route: 'Meow' },
];

interface SectionTileProps {
  link: SectionLink;
  onPress: () => void;
}

const SectionTile = ({ link, onPress }: SectionTileProps): JSX.Element => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const Icon = link.icon;

  return (
    <Card
      variant="interactive"
      size="sm"
      onPress={onPress}
      accessibilityLabel={link.label}
      style={styles.tile}
    >
      <Icon size={20} strokeWidth={2} color={theme.text} />
      <Text style={styles.tileLabel} numberOfLines={1}>
        {link.label}
      </Text>
    </Card>
  );
};

export const DashboardScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();
  const userName = useAuthStore((state) => state.user?.name ?? '');
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const greeting = greetingFor(new Date().getHours());
  const navigateTo = (route: AppRoute): void => navigation.navigate(route as never);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Hoy</Text>
          <Text style={styles.greeting} numberOfLines={1}>
            {userName ? `${greeting}, ${userName}` : greeting}
          </Text>
          {data ? <Text style={styles.date}>{formatFriendlyDate(data.date)}</Text> : null}
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={Bell}
            accessibilityLabel="Notificaciones"
            onPress={() => navigateTo('NotificationsList')}
          />
          <Pressable
            onPress={() => navigateTo('Account')}
            accessibilityRole="button"
            accessibilityLabel="Cuenta"
          >
            <Avatar name={userName || '?'} size={40} />
          </Pressable>
        </View>
      </View>

      {isLoading ? <Spinner /> : null}
      {isError ? <ErrorState message={error.message} onRetry={() => void refetch()} /> : null}

      {data ? (
        <>
          {data.meowSummary ? (
            <Card size="sm" style={styles.meowCard}>
              <View style={styles.meowRow}>
                <Cat size={18} strokeWidth={2} color={theme.textMuted} />
                <Text style={styles.meowText}>{data.meowSummary}</Text>
              </View>
            </Card>
          ) : null}

          <View style={styles.statsRow}>
            <StatTile
              label="Tareas"
              value={data.tasksToday.length}
              onPress={() => navigateTo('TasksList')}
            />
            <StatTile
              label="Eventos"
              value={data.eventsToday.length}
              onPress={() => navigateTo('Calendar')}
            />
            <StatTile
              label="Listas"
              value={data.openShoppingLists.length}
              onPress={() => navigateTo('ShoppingLists')}
            />
          </View>
        </>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.groupTitle}>En casa</Text>
        <View style={styles.tilesGrid}>
          {EN_CASA.map((link) => (
            <SectionTile key={link.key} link={link} onPress={() => navigateTo(link.route)} />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Más</Text>
        <View style={styles.tilesGrid}>
          {MAS.map((link) => (
            <SectionTile key={link.key} link={link} onPress={() => navigateTo(link.route)} />
          ))}
        </View>
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
    gap: spacing.s5,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s3,
  },
  headerText: {
    flex: 1,
    gap: spacing.s1,
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
  },
  heading: {
    ...typography.h1,
    color: theme.text,
  },
  greeting: {
    ...typography.body,
    color: theme.textMuted,
  },
  date: {
    ...typography.caption,
    color: theme.textMuted,
  },
  meowCard: {
    backgroundColor: theme.surfaceAlt,
  },
  meowRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s2,
  },
  meowText: {
    ...typography.bodySmall,
    color: theme.textMuted,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
  },
  stat: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    ...typography.h3,
    color: theme.text,
  },
  statLabel: {
    ...typography.caption,
    color: theme.textMuted,
  },
  group: {
    gap: spacing.s2,
  },
  groupTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  tilesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s3,
  },
  tile: {
    width: '47%' as const,
  },
  tileLabel: {
    ...typography.bodySmall,
    color: theme.text,
  },
});
