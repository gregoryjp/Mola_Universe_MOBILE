import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * The five sections promoted to the floating tab bar (GAP 4). They are the
 * top-level sections Dashboard already linked to; every other screen is pushed
 * on top of the tab navigator.
 */
export type MainTabParamList = {
  Dashboard: undefined;
  TasksList: undefined;
  ShoppingLists: undefined;
  Expenses: undefined;
  Calendar: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  CreateHousehold: undefined;
  TaskDetail: { taskId: string };
  TaskForm: undefined;
  ShoppingItemForm: { listId: string };
  InventoryList: undefined;
  InventoryItemDetail: { itemId: string };
  ExpenseDetail: { expenseId: string };
  ExpenseForm: undefined;
  RecurringExpenses: undefined;
  RecurringExpenseForm: { recurringId?: string };
  Savings: undefined;
  SavingsGoalDetail: { goalId: string };
  SavingsGoalForm: undefined;
  CalendarEventDetail: { eventId: string };
  CalendarEventForm: { eventId?: string };
  NotificationsList: undefined;
  Pets: undefined;
  PetDetail: { petId: string };
  PetForm: { petId?: string };
  SOSActivation: undefined;
  TrustedContacts: undefined;
  Moments: undefined;
  MomentDetail: { momentId: string };
  MomentForm: { momentId?: string };
  Account: undefined;
};

/**
 * Props of a tab screen. The composite type is needed because tab screens still
 * push stack routes (Dashboard links to the sections that are not tabs).
 */
export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
