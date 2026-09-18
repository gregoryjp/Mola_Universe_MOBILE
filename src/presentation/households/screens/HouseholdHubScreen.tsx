import type { MainTabParamList, RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { EmptyState, ScreenHeader, SectionHeader, Spinner } from '@presentation/components/ui';
import { useHouseholdTasks } from '@presentation/tasks/hooks/useHouseholdTasks';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import {
  Calendar,
  ChevronRight,
  Image as ImageIcon,
  ListTodo,
  Package,
  PawPrint,
  PiggyBank,
  RefreshCw,
  ShoppingCart,
  Wallet,
} from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CreateHouseholdButton } from '../components/CreateHouseholdButton';
import { HouseholdSelector } from '../components/HouseholdSelector';
import { useHouseholds } from '../hooks/useHouseholds';

type Props = NativeStackScreenProps<RootStackParamList, 'HouseholdHub'>;

interface HubIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Both navigators: the hub opens tab sections and pushes stack sections. */
type AppRoute = keyof MainTabParamList | keyof RootStackParamList;

interface HubLink {
  key: string;
  label: string;
  icon: ComponentType<HubIconProps>;
  route: AppRoute;
}

interface HubGroup {
  key: string;
  title: string;
  links: HubLink[];
}

/**
 * Tab sections are already mounted inside `MainTabs`; a bare `navigate('TasksList')`
 * would not resolve from the root stack. Reaching them goes through the parent
 * route so the existing tab navigator is reused instead of duplicated.
 */
const TAB_ROUTES: readonly AppRoute[] = [
  'Dashboard',
  'TasksList',
  'ShoppingLists',
  'Expenses',
  'Calendar',
];

/**
 * Casa groups the household capabilities by intention instead of listing the
 * modules. Every entry is a real, already-built screen — this screen adds no
 * capability, it only makes the existing ones reachable.
 *
 * Inventario lives here because it was fully built (list + item detail) with no
 * entry point anywhere in the app. Gastos recurrentes lives here too: it was
 * only reachable from the bottom of the Gastos tab.
 */
const GROUPS: HubGroup[] = [
  {
    key: 'organize',
    title: 'Organizar',
    links: [
      { key: 'tasks', label: 'Tareas', icon: ListTodo, route: 'TasksList' },
      { key: 'calendar', label: 'Calendario', icon: Calendar, route: 'Calendar' },
    ],
  },
  {
    key: 'buy-maintain',
    title: 'Comprar y mantener',
    links: [
      { key: 'shopping', label: 'Compras', icon: ShoppingCart, route: 'ShoppingLists' },
      { key: 'inventory', label: 'Inventario', icon: Package, route: 'InventoryList' },
    ],
  },
  {
    key: 'shared-money',
    title: 'Dinero compartido',
    links: [
      { key: 'expenses', label: 'Gastos', icon: Wallet, route: 'Expenses' },
      {
        key: 'recurring',
        label: 'Gastos recurrentes',
        icon: RefreshCw,
        route: 'RecurringExpenses',
      },
      { key: 'savings', label: 'Ahorros', icon: PiggyBank, route: 'Savings' },
    ],
  },
  {
    key: 'family',
    title: 'Familia',
    links: [
      { key: 'pets', label: 'Mascotas', icon: PawPrint, route: 'Pets' },
      { key: 'moments', label: 'Momentos', icon: ImageIcon, route: 'Moments' },
    ],
  },
];

interface HubRowProps {
  link: HubLink;
  onPress: () => void;
}

const HubRow = ({ link, onPress }: HubRowProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const Icon = link.icon;

  return (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={link.label}
      testID={`casa-${link.key}`}
    >
      <Icon size={20} strokeWidth={2} color={styles.linkIcon.color} />
      <Text style={styles.linkLabel} numberOfLines={1}>
        {link.label}
      </Text>
      <ChevronRight size={18} strokeWidth={2} color={styles.linkChevron.color} />
    </TouchableOpacity>
  );
};

const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** Household hub: the system of the home, grouped by what the user wants to do. */
export const HouseholdHubScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error } = useHouseholds({ enabled: true });
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const styles = useThemedStyles(makeStyles);

  const households = data ?? [];
  const activeHousehold =
    activeHouseholdId === null
      ? undefined
      : households.find((household) => household.id === activeHouseholdId);
  const hasHouseholds = households.length > 0;

  /**
   * Contextual line, not a menu entry: the hub should answer "is there anything
   * waiting at home?" before the user picks a section. `status: PENDING` keeps
   * `total` exact (the list endpoint filters server-side), so this never shows a
   * count derived from an under-paginated page.
   */
  const pending = useHouseholdTasks({ status: 'PENDING', limit: 1 });
  const pendingTotal = pending.data?.pages[0]?.total;
  const contextLine =
    pendingTotal === undefined
      ? null
      : pendingTotal === 0
        ? 'No hay tareas pendientes'
        : plural(pendingTotal, 'tarea pendiente', 'tareas pendientes');

  const openLink = (route: AppRoute): void => {
    if (TAB_ROUTES.includes(route)) {
      navigation.navigate('MainTabs', { screen: route as keyof MainTabParamList });
      return;
    }
    navigation.navigate(route as never);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="casa-scroll"
    >
      <View style={styles.header}>
        <ScreenHeader title="Casa" onBack={() => navigation.goBack()} testID="casa-header" />
        <Text style={styles.subtitle}>
          {activeHousehold
            ? `${activeHousehold.name} · ${plural(activeHousehold.memberCount, 'persona', 'personas')}`
            : 'El sistema de tu hogar'}
        </Text>
      </View>

      {isLoading ? (
        <View testID="casa-loading">
          <Spinner />
        </View>
      ) : null}

      {isError ? <Text style={styles.error}>{error.message}</Text> : null}

      {!isLoading && !isError && !hasHouseholds ? (
        <EmptyState
          title="Todavía no tienes un hogar"
          description="Crea un hogar para compartir tareas, compras, inventario y gastos."
          actionLabel="Crear un hogar"
          onAction={() => navigation.navigate('CreateHousehold')}
          testID="casa-empty"
        />
      ) : null}

      {!isLoading && !isError && hasHouseholds ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionHint}>Hogar activo</Text>
            <HouseholdSelector />
          </View>

          {contextLine !== null ? (
            <View style={styles.section} testID="casa-context">
              <SectionHeader title="En casa" />
              <View style={styles.contextCard}>
                <Text style={styles.contextText} testID="casa-context-line">
                  {contextLine}
                </Text>
              </View>
            </View>
          ) : null}

          {GROUPS.map((group) => (
            <View key={group.key} style={styles.section} testID={`casa-group-${group.key}`}>
              <SectionHeader title={group.title} />
              <View style={styles.linkList}>
                {group.links.map((link) => (
                  <HubRow key={link.key} link={link} onPress={() => openLink(link.route)} />
                ))}
              </View>
            </View>
          ))}

          <View style={styles.section} testID="casa-group-manage">
            <SectionHeader title="Gestión del hogar" />
            <CreateHouseholdButton />
          </View>
        </>
      ) : null}
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
  header: {
    gap: spacing.s1,
  },
  subtitle: {
    ...typography.body,
    color: theme.textMuted,
  },
  section: {
    gap: spacing.s2,
  },
  sectionHint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  linkList: {
    gap: spacing.s2,
  },
  contextCard: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
  },
  contextText: {
    ...typography.body,
    color: theme.text,
  },
  linkRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
    minHeight: 48,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  linkIcon: {
    color: theme.textMuted,
  },
  linkLabel: {
    ...typography.body,
    color: theme.text,
    flex: 1,
  },
  linkChevron: {
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
