import type { ColorTokens } from '@core/theme';
import { radius, shadows, spacing, typography, useThemedStyles } from '@core/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Calendar, House, ListTodo, ShoppingCart, Wallet } from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { MainTabParamList } from './types';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * GAP 4: navigation.md mandates a floating tab bar but does not say which
 * sections become tabs. The five top-level sections that Dashboard already
 * links to are used; the rest stay reachable from Dashboard, so nothing becomes
 * unreachable while the product picks the final information architecture.
 */
const TAB_ICONS: Record<keyof MainTabParamList, ComponentType<IconProps>> = {
  Dashboard: House,
  TasksList: ListTodo,
  ShoppingLists: ShoppingCart,
  Expenses: Wallet,
  Calendar: Calendar,
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'Inicio',
  TasksList: 'Tareas',
  ShoppingLists: 'Compras',
  Expenses: 'Gastos',
  Calendar: 'Agenda',
};

/**
 * Floating tab bar from design/components/navigation.md: a rounded surface with
 * outer margins instead of a bar glued to the screen edges. It is laid out in
 * normal flow (not absolutely positioned) so it never covers screen content and
 * no screen needs extra bottom padding.
 */
export const FloatingTabBar = ({ state, navigation }: BottomTabBarProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const name = route.name as keyof MainTabParamList;
        const isFocused = state.index === index;
        const Icon = TAB_ICONS[name];
        const label = TAB_LABELS[name];

        const onPress = (): void => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.item, isFocused && styles.itemActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
          >
            <Icon
              size={24}
              strokeWidth={2}
              color={isFocused ? styles.iconActive.color : styles.icon.color}
            />
            <Text style={isFocused ? styles.labelActive : styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  bar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginHorizontal: spacing.s4,
    marginBottom: spacing.s3,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.s1,
    paddingVertical: spacing.s2,
    ...shadows.md,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 2,
    borderRadius: radius.md,
  },
  /**
   * navigation.md does not state the active-tab treatment, so two constraints
   * decide it: `primary` on `surface` is only 2.06:1, and `primarySoft` reuses
   * the light mint in dark mode, which makes `text` (now #F5F5F5) read at
   * 1.03:1 — invisible. `surfaceAlt` is defined for both palettes, so the pill
   * clears AA in light (15.24:1) and dark (13.28:1). See GAP 3.
   */
  itemActive: {
    backgroundColor: theme.surfaceAlt,
  },
  icon: {
    color: theme.textMuted,
  },
  iconActive: {
    color: theme.text,
  },
  label: {
    ...typography.caption,
    color: theme.textMuted,
  },
  labelActive: {
    ...typography.caption,
    color: theme.text,
  },
});
