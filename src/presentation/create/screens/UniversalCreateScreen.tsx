import type { MainTabParamList, RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, useThemedStyles } from '@core/theme';
import {
  NavRow,
  type NavRowIconProps,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Calendar,
  Image as ImageIcon,
  ListTodo,
  PawPrint,
  ShoppingCart,
  Wallet,
} from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import { View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'UniversalCreate'>;

/** Screens that own a create flow of their own. */
type CreateRoute =
  | 'QuickTaskCreate'
  | 'CalendarEventForm'
  | 'ExpenseForm'
  | 'MomentForm'
  | 'PetForm';

type Destination =
  | { kind: 'push'; route: CreateRoute }
  | { kind: 'tab'; tab: keyof MainTabParamList };

interface CreateEntry {
  key: string;
  label: string;
  hint: string;
  icon: ComponentType<NavRowIconProps>;
  destination: Destination;
}

/**
 * Ordered by how often each thing is created, not by module name — this is the
 * only ordering the user sees.
 */
const FREQUENT: readonly CreateEntry[] = [
  {
    key: 'task',
    label: 'Tarea',
    hint: 'Algo que hay que hacer',
    icon: ListTodo,
    destination: { kind: 'push', route: 'QuickTaskCreate' },
  },
  {
    key: 'event',
    label: 'Evento',
    hint: 'Una cita con fecha y hora',
    icon: Calendar,
    destination: { kind: 'push', route: 'CalendarEventForm' },
  },
  {
    key: 'shopping',
    label: 'Compra',
    hint: 'Listas y productos de casa',
    icon: ShoppingCart,
    destination: { kind: 'tab', tab: 'ShoppingLists' },
  },
  {
    key: 'expense',
    label: 'Gasto',
    hint: 'Un pago puntual',
    icon: Wallet,
    destination: { kind: 'push', route: 'ExpenseForm' },
  },
  {
    key: 'moment',
    label: 'Momento',
    hint: 'Algo que queréis guardar',
    icon: ImageIcon,
    destination: { kind: 'push', route: 'MomentForm' },
  },
];

const SECONDARY: readonly CreateEntry[] = [
  {
    key: 'pet',
    label: 'Mascota',
    hint: 'Añadir una mascota a casa',
    icon: PawPrint,
    destination: { kind: 'push', route: 'PetForm' },
  },
];

/**
 * Universal Create: the single front door behind the global "+".
 *
 * It creates nothing itself — every row lands on the screen that already owns
 * that flow, so there is exactly one implementation per type. "Compra" is the
 * one entry that opens a section instead of a form: a shopping item needs a
 * list, and lists are created inside the Compras tab, so a standalone item form
 * here would build something the user could not save.
 */
export const UniversalCreateScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  const openPush = (route: CreateRoute): void => {
    switch (route) {
      case 'QuickTaskCreate':
        navigation.navigate('QuickTaskCreate');
        return;
      case 'CalendarEventForm':
        navigation.navigate('CalendarEventForm', {});
        return;
      case 'MomentForm':
        navigation.navigate('MomentForm', {});
        return;
      case 'PetForm':
        navigation.navigate('PetForm', {});
        return;
      case 'ExpenseForm':
        navigation.navigate('ExpenseForm');
    }
  };

  const open = (destination: Destination): void => {
    if (destination.kind === 'tab') {
      navigation.navigate('MainTabs', { screen: destination.tab });
      return;
    }
    openPush(destination.route);
  };

  return (
    <Screen gap={spacing.s5} testID="universal-create-screen">
      <ScreenHeader
        title="¿Qué quieres añadir?"
        onBack={() => navigation.goBack()}
        testID="universal-create-header"
      />

      <View style={styles.list}>
        {FREQUENT.map((entry) => (
          <NavRow
            key={entry.key}
            icon={entry.icon}
            label={entry.label}
            hint={entry.hint}
            onPress={() => open(entry.destination)}
            testID={`create-${entry.key}`}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Más" />
        <View style={styles.list}>
          {SECONDARY.map((entry) => (
            <NavRow
              key={entry.key}
              icon={entry.icon}
              label={entry.label}
              hint={entry.hint}
              onPress={() => open(entry.destination)}
              testID={`create-${entry.key}`}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  list: {
    gap: spacing.s1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    paddingVertical: spacing.s1,
  },
  section: {
    gap: spacing.s2,
  },
});
