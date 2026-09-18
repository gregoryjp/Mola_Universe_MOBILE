import type { MainTabParamList, RootStackParamList, TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { breakpoints, radius, spacing, typography, useThemedStyles } from '@core/theme';
import type {
  DashboardEvent,
  DashboardShoppingList,
} from '@domain/dashboard/entities/DashboardSummary';
import type { Task } from '@domain/tasks/entities/Task';
import { BrandLogo } from '@presentation/components/brand/BrandLogo';
import {
  Avatar,
  EmptyState,
  ErrorState,
  IconButton,
  QuickAction,
  SectionHeader,
  Skeleton,
} from '@presentation/components/ui';
import { useHouseholds } from '@presentation/households/hooks/useHouseholds';
import { TaskRow } from '@presentation/tasks/components/TaskRow';
import { useAuthStore } from '@shared/store/authStore';
import { useHouseholdStore } from '@shared/store/householdStore';
import {
  Bell,
  Calendar,
  Cat,
  ChevronRight,
  House,
  Image as ImageIcon,
  ListTodo,
  PawPrint,
  PiggyBank,
  ShieldAlert,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

/** Every real, reachable route this screen can navigate to — spans both the tab
 * navigator and the root stack, since Hoy links to both. */
type AppRoute = keyof MainTabParamList | keyof RootStackParamList;

type Props = TabScreenProps<'Dashboard'>;

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

interface SectionLink {
  key: string;
  label: string;
  icon: ComponentType<IconProps>;
  route: AppRoute;
}

/**
 * How many rows each day section shows before "Ver todas" takes over.
 * Progressive disclosure: Hoy is a place to act on the next few things, not a
 * second copy of the Tareas and Agenda tabs.
 */
const MAX_TASKS = 3;
const MAX_EVENTS = 2;
const MAX_LISTS = 2;

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
const formatFriendlyDate = (date: Date): string =>
  `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;

const greetingFor = (hour: number): string => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

/** "a, b y c" — no trailing comma, because Spanish does not use one. */
const joinNatural = (parts: string[]): string => {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0] ?? '';
  const head = parts.slice(0, -1).join(', ');
  return `${head} y ${parts[parts.length - 1]}`;
};

const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

const isOpenTask = (task: Task): boolean =>
  task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

/**
 * The quick captures that have a real destination. There is deliberately no
 * "buscar" here: no search route exists, and a dead control is worse than none.
 */
const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: ComponentType<IconProps>;
  route: AppRoute;
}[] = [
  { key: 'task', label: 'Nueva tarea', icon: ListTodo, route: 'TaskForm' },
  { key: 'event', label: 'Nuevo evento', icon: Calendar, route: 'CalendarEventForm' },
  { key: 'expense', label: 'Nuevo gasto', icon: Wallet, route: 'ExpenseForm' },
  { key: 'sos', label: 'SOS', icon: ShieldAlert, route: 'SOSActivation' },
];

/**
 * The sections that are NOT one of the five tabs, and therefore have no other
 * way in. Hoy is their only entry point, so this list survives the redesign —
 * as a compact row per section instead of a grid of tinted cards.
 */
const MORE_LINKS: SectionLink[] = [
  { key: 'pets', label: 'Mascotas', icon: PawPrint, route: 'Pets' },
  { key: 'moments', label: 'Momentos', icon: ImageIcon, route: 'Moments' },
  { key: 'savings', label: 'Ahorros', icon: PiggyBank, route: 'Savings' },
  { key: 'sos', label: 'SOS', icon: ShieldAlert, route: 'SOSActivation' },
  { key: 'contacts', label: 'Contactos de confianza', icon: Users, route: 'TrustedContacts' },
  { key: 'meow', label: 'Meow', icon: Cat, route: 'Meow' },
  { key: 'account', label: 'Cuenta', icon: User, route: 'Account' },
];

interface MoreRowProps {
  link: SectionLink;
  onPress: () => void;
}

const MoreRow = ({ link, onPress }: MoreRowProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const Icon = link.icon;

  return (
    <TouchableOpacity
      style={styles.moreRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={link.label}
      testID={`more-${link.key}`}
    >
      <Icon size={20} strokeWidth={2} color={styles.moreIcon.color} />
      <Text style={styles.moreLabel} numberOfLines={1}>
        {link.label}
      </Text>
      <ChevronRight size={18} strokeWidth={2} color={styles.moreChevron.color} />
    </TouchableOpacity>
  );
};

export const DashboardScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboardSummary();
  const userName = useAuthStore((state) => state.user?.name ?? '');
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const { data: households } = useHouseholds({ enabled: true });
  const styles = useThemedStyles(makeStyles);

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const navigateTo = (route: AppRoute): void => navigation.navigate(route as never);

  // Distinguishable without NetInfo: the API client reports a transport failure
  // as NETWORK_ERROR, so "no connection" is told apart from "the server said no".
  const isOffline = isError && error.code === 'NETWORK_ERROR';

  const openTasks = (data?.tasksToday ?? []).filter(isOpenTask);
  const events = data?.eventsToday ?? [];
  const lists = data?.openShoppingLists ?? [];

  const dayParts = [
    openTasks.length > 0 ? plural(openTasks.length, 'tarea', 'tareas') : '',
    events.length > 0 ? plural(events.length, 'evento', 'eventos') : '',
    lists.length > 0 ? `${plural(lists.length, 'lista', 'listas')} de la compra` : '',
  ].filter((part) => part !== '');
  const daySummary = joinNatural(dayParts);

  const activeHousehold =
    activeHouseholdId === null
      ? undefined
      : households?.find((household) => household.id === activeHouseholdId);

  // "En casa" is the way into Casa, so it cannot depend on a household being
  // active: a user who only has "Personal" selected (or none at all) still needs
  // a door to the hub, otherwise Inventario and the household setup stay out of
  // reach from Hoy.
  const householdCount = households?.length ?? 0;
  const houseTitle = activeHousehold
    ? activeHousehold.name
    : householdCount > 0
      ? 'Personal'
      : 'Sin hogar';
  const houseMeta = activeHousehold
    ? plural(activeHousehold.memberCount, 'persona', 'personas')
    : householdCount > 0
      ? 'Toca para cambiar de hogar'
      : 'Crea tu hogar para compartir';

  const hasDayContent = openTasks.length > 0 || events.length > 0 || lists.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      testID="hoy-scroll"
    >
      <View style={styles.headerRow}>
        <BrandLogo width={104} />
        <View style={styles.headerActions}>
          <IconButton
            icon={Bell}
            accessibilityLabel="Notificaciones"
            onPress={() => navigateTo('NotificationsList')}
          />
          <TouchableOpacity
            onPress={() => navigateTo('Account')}
            accessibilityRole="button"
            accessibilityLabel="Cuenta"
          >
            <Avatar name={userName || '?'} size={40} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={styles.greeting} accessibilityRole="header">
          {userName ? `${greeting}, ${userName.split(' ')[0]}` : greeting}
        </Text>
        <Text style={styles.date}>{formatFriendlyDate(now)}</Text>
      </View>

      {isOffline ? (
        <View style={styles.offlineBox} testID="hoy-offline">
          <Text style={styles.offlineTitle}>Sin conexión</Text>
          <Text style={styles.offlineText}>
            No hemos podido actualizar tu día. Lo que ves puede estar desactualizado.
          </Text>
        </View>
      ) : null}

      {!isOffline && isError ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : null}

      {isLoading ? (
        <View style={styles.skeletons} testID="hoy-loading">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="list" />
          <Skeleton variant="list" />
        </View>
      ) : null}

      {!isLoading && !isError ? (
        <View style={styles.dayBlock}>
          <Text style={styles.daySummary} testID="hoy-day-summary">
            {hasDayContent ? daySummary : 'Hoy no tienes nada programado.'}
          </Text>
          {hasDayContent ? (
            <Text style={styles.dayHint}>Esto es lo que tienes por delante.</Text>
          ) : null}
        </View>
      ) : null}

      {data?.meowSummary ? (
        <TouchableOpacity
          style={styles.meowRow}
          onPress={() => navigateTo('Meow')}
          accessibilityRole="button"
          accessibilityLabel={`Meow: ${data.meowSummary}`}
          accessibilityHint="Abre Meow para preguntar más"
          testID="hoy-meow"
        >
          <Cat size={18} strokeWidth={2} color={styles.meowIcon.color} />
          <Text style={styles.meowText}>{data.meowSummary}</Text>
          <ChevronRight size={18} strokeWidth={2} color={styles.moreChevron.color} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map((action) => (
          <QuickAction
            key={action.key}
            icon={action.icon}
            label={action.label}
            onPress={() => navigateTo(action.route)}
            accessibilityLabel={action.label}
            testID={`quick-${action.key}`}
          />
        ))}
      </View>

      {openTasks.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Tareas de hoy"
            count={openTasks.length}
            actionLabel="Ver todas"
            actionAccessibilityLabel="Ver todas las tareas"
            onAction={() => navigateTo('TasksList')}
            testID="hoy-tasks"
          />
          {openTasks.slice(0, MAX_TASKS).map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              testID={`hoy-task-${task.id}`}
            />
          ))}
        </View>
      ) : null}

      {events.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Agenda de hoy"
            count={events.length}
            actionLabel="Ver agenda"
            actionAccessibilityLabel="Ver la agenda"
            onAction={() => navigateTo('Calendar')}
            testID="hoy-events"
          />
          {events.slice(0, MAX_EVENTS).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </View>
      ) : null}

      {lists.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Listas abiertas"
            count={lists.length}
            actionLabel="Ir a compras"
            actionAccessibilityLabel="Ir a las listas de la compra"
            onAction={() => navigateTo('ShoppingLists')}
            testID="hoy-lists"
          />
          {lists.slice(0, MAX_LISTS).map((list) => (
            <ListRow key={list.id} list={list} />
          ))}
        </View>
      ) : null}

      {!isLoading && !isError && !hasDayContent ? (
        <EmptyState
          title="Tu día está despejado"
          description="Cuando tengas tareas, eventos o listas para hoy aparecerán aquí."
          actionLabel="Crear una tarea"
          onAction={() => navigateTo('TaskForm')}
          testID="hoy-empty"
        />
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="En casa"
          actionLabel="Abrir"
          actionAccessibilityLabel="Abrir Casa"
          onAction={() => navigateTo('HouseholdHub')}
          testID="hoy-household"
        />
        <TouchableOpacity
          style={styles.houseRow}
          onPress={() => navigateTo('HouseholdHub')}
          accessibilityRole="button"
          accessibilityLabel={`Casa: ${houseTitle}`}
          accessibilityHint="Abre Casa, el sistema de tu hogar"
          testID="hoy-household-row"
        >
          <House size={20} strokeWidth={2} color={styles.moreIcon.color} />
          <View style={styles.houseText}>
            <Text style={styles.houseName} numberOfLines={1}>
              {houseTitle}
            </Text>
            <Text style={styles.houseMeta}>{houseMeta}</Text>
          </View>
          <ChevronRight size={18} strokeWidth={2} color={styles.moreChevron.color} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Más en MOLA" testID="hoy-more" />
        <View style={styles.moreList}>
          {MORE_LINKS.map((link) => (
            <MoreRow key={link.key} link={link} onPress={() => navigateTo(link.route)} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const EventRow = ({ event }: { event: DashboardEvent }): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.plainRow} testID={`hoy-event-${event.id}`}>
      <Text style={styles.plainTitle} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.plainMeta}>{EVENT_TYPE_LABELS[event.type]}</Text>
    </View>
  );
};

const ListRow = ({ list }: { list: DashboardShoppingList }): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.plainRow} testID={`hoy-list-${list.id}`}>
      <Text style={styles.plainTitle} numberOfLines={1}>
        {list.name}
      </Text>
    </View>
  );
};

/** The backend's `CalendarEventType`, in the reader's language. */
const EVENT_TYPE_LABELS: Record<DashboardEvent['type'], string> = {
  GENERAL: 'General',
  BIRTHDAY: 'Cumpleaños',
  APPOINTMENT: 'Cita',
  PAYMENT: 'Pago',
  SUBSCRIPTION: 'Suscripción',
  INSURANCE: 'Seguro',
  MAINTENANCE: 'Mantenimiento',
  PET: 'Mascota',
  TRIP: 'Viaje',
  CUSTOM: 'Evento',
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingHorizontal: spacing.s6,
    paddingTop: spacing.s6,
    paddingBottom: spacing.s16,
    gap: spacing.s6,
    alignSelf: 'center' as const,
    width: '100%' as const,
    maxWidth: breakpoints.tablet,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s4,
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s2,
  },
  greetingBlock: {
    gap: spacing.s1,
  },
  greeting: {
    ...typography.h2,
    color: theme.text,
  },
  date: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  // A notice, not an error, so it takes the warning tone. `warning` is used for
  // the border only: as TEXT it measures 1.42:1 on `warningSoft` in light mode
  // (the same defect TD-040 tracks for Badge's chromatic variants). The body uses
  // `text`, which clears AA on this fill in both palettes (15.92:1 / 9.16:1).
  offlineBox: {
    gap: spacing.s1,
    backgroundColor: theme.warningSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.warning,
    padding: spacing.s4,
  },
  offlineTitle: {
    ...typography.body,
    color: theme.text,
  },
  offlineText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  skeletons: {
    gap: spacing.s3,
  },
  dayBlock: {
    gap: spacing.s1,
  },
  daySummary: {
    ...typography.bodyLarge,
    color: theme.text,
  },
  dayHint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  meowRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s4,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  meowIcon: {
    color: theme.textMuted,
  },
  meowText: {
    ...typography.bodySmall,
    color: theme.text,
    flex: 1,
  },
  quickRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s2,
  },
  section: {
    gap: spacing.s2,
  },
  plainRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s3,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s4,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  plainTitle: {
    ...typography.body,
    color: theme.text,
    flexShrink: 1,
  },
  plainMeta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  houseRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s4,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  houseText: {
    flex: 1,
  },
  houseName: {
    ...typography.body,
    color: theme.text,
  },
  houseMeta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  moreList: {
    gap: spacing.s1,
  },
  moreRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
    // 12 + a 24px line + 12 = the 44px minimum target without a card around it.
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s1,
  },
  moreIcon: {
    color: theme.text,
  },
  moreChevron: {
    color: theme.textMuted,
  },
  moreLabel: {
    ...typography.body,
    color: theme.text,
    flex: 1,
  },
});
