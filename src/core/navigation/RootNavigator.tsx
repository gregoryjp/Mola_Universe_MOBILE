import { colors } from '@core/theme';
import { AccountScreen } from '@presentation/account/screens/AccountScreen';
import { ChooseMethodScreen } from '@presentation/auth/screens/ChooseMethodScreen';
import { ForgotPasswordScreen } from '@presentation/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '@presentation/auth/screens/LoginScreen';
import { OnboardingScreen } from '@presentation/auth/screens/OnboardingScreen';
import { RegisterScreen } from '@presentation/auth/screens/RegisterScreen';
import { ResetPasswordOtpScreen } from '@presentation/auth/screens/ResetPasswordOtpScreen';
import { ResetPasswordScreen } from '@presentation/auth/screens/ResetPasswordScreen';
import { ResetPasswordSuccessScreen } from '@presentation/auth/screens/ResetPasswordSuccessScreen';
import { SplashScreen } from '@presentation/auth/screens/SplashScreen';
import { ValuePropsScreen } from '@presentation/auth/screens/ValuePropsScreen';
import { VerifyEmailScreen } from '@presentation/auth/screens/VerifyEmailScreen';
import { WelcomeScreen } from '@presentation/auth/screens/WelcomeScreen';
import { CalendarEventDetailScreen } from '@presentation/calendar/screens/CalendarEventDetailScreen';
import { CalendarEventFormScreen } from '@presentation/calendar/screens/CalendarEventFormScreen';
import { RecurringExpenseFormScreen } from '@presentation/expenses/recurring/screens/RecurringExpenseFormScreen';
import { RecurringExpensesListScreen } from '@presentation/expenses/recurring/screens/RecurringExpensesListScreen';
import { ExpenseDetailScreen } from '@presentation/expenses/screens/ExpenseDetailScreen';
import { ExpenseFormScreen } from '@presentation/expenses/screens/ExpenseFormScreen';
import { useDefaultActiveHousehold } from '@presentation/households/hooks/useDefaultActiveHousehold';
import { CreateHouseholdScreen } from '@presentation/households/screens/CreateHouseholdScreen';
import { InventoryItemDetailScreen } from '@presentation/inventory/screens/InventoryItemDetailScreen';
import { InventoryListScreen } from '@presentation/inventory/screens/InventoryListScreen';
import { MeowScreen } from '@presentation/meow/screens/MeowScreen';
import { MomentDetailScreen } from '@presentation/moments/screens/MomentDetailScreen';
import { MomentFormScreen } from '@presentation/moments/screens/MomentFormScreen';
import { MomentsListScreen } from '@presentation/moments/screens/MomentsListScreen';
import { usePushRegistrationStatus } from '@presentation/notifications/hooks/usePushRegistration';
import { NotificationsListScreen } from '@presentation/notifications/screens/NotificationsListScreen';
import { PetDetailScreen } from '@presentation/pets/screens/PetDetailScreen';
import { PetFormScreen } from '@presentation/pets/screens/PetFormScreen';
import { PetsListScreen } from '@presentation/pets/screens/PetsListScreen';
import { SavingsGoalDetailScreen } from '@presentation/savings/screens/SavingsGoalDetailScreen';
import { SavingsGoalFormScreen } from '@presentation/savings/screens/SavingsGoalFormScreen';
import { SavingsScreen } from '@presentation/savings/screens/SavingsScreen';
import { ShoppingItemFormScreen } from '@presentation/shopping/screens/ShoppingItemFormScreen';
import { SOSActivationScreen } from '@presentation/sos/screens/SOSActivationScreen';
import { TrustedContactsScreen } from '@presentation/sos/screens/TrustedContactsScreen';
import { TaskDetailScreen } from '@presentation/tasks/screens/TaskDetailScreen';
import { TaskFormScreen } from '@presentation/tasks/screens/TaskFormScreen';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useColorScheme } from 'react-native';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Maps the design tokens onto React Navigation's own theme contract. */
const useNavigationTheme = (): Theme => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const base = isDark ? NavDarkTheme : NavDefaultTheme;

  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.accent,
    },
  };
};

export const RootNavigator = (): JSX.Element => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // An authenticated-but-unverified user (registered, not yet through OTP)
  // gets the VerifyEmail-only branch below instead of MainTabs. `undefined`/
  // `null` user (e.g. mid-hydration) is not treated as unverified — only an
  // explicit `false` routes here.
  const isEmailUnverified = useAuthStore((state) => state.user?.emailVerified === false);
  const theme = useNavigationTheme();
  // TD-026: registers this device silently on login and on app start with a
  // live session. Disabled by itself while there is no session.
  usePushRegistrationStatus();
  // P0-4: picks a default active household when the user never chose one.
  useDefaultActiveHousehold();

  // Checked before every other branch: while the persisted session hasn't
  // been read yet (see `authStore.hydrate`), we don't know whether to show
  // the unauthenticated, unverified, or authenticated stack, so nothing in
  // `NavigationContainer` renders until it settles.
  if (!isHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ValueProps" component={ValuePropsScreen} />
            <Stack.Screen name="ChooseMethod" component={ChooseMethodScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPasswordOtp" component={ResetPasswordOtpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="ResetPasswordSuccess" component={ResetPasswordSuccessScreen} />
          </>
        ) : isEmailUnverified ? (
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
            <Stack.Screen name="ShoppingItemForm" component={ShoppingItemFormScreen} />
            <Stack.Screen name="InventoryList" component={InventoryListScreen} />
            <Stack.Screen name="InventoryItemDetail" component={InventoryItemDetailScreen} />
            <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
            <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
            <Stack.Screen name="RecurringExpenses" component={RecurringExpensesListScreen} />
            <Stack.Screen name="RecurringExpenseForm" component={RecurringExpenseFormScreen} />
            <Stack.Screen name="Savings" component={SavingsScreen} />
            <Stack.Screen name="SavingsGoalDetail" component={SavingsGoalDetailScreen} />
            <Stack.Screen name="SavingsGoalForm" component={SavingsGoalFormScreen} />
            <Stack.Screen name="CalendarEventDetail" component={CalendarEventDetailScreen} />
            <Stack.Screen name="CalendarEventForm" component={CalendarEventFormScreen} />
            <Stack.Screen name="NotificationsList" component={NotificationsListScreen} />
            <Stack.Screen name="Pets" component={PetsListScreen} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} />
            <Stack.Screen name="PetForm" component={PetFormScreen} />
            <Stack.Screen name="SOSActivation" component={SOSActivationScreen} />
            <Stack.Screen name="TrustedContacts" component={TrustedContactsScreen} />
            <Stack.Screen name="Moments" component={MomentsListScreen} />
            <Stack.Screen name="MomentDetail" component={MomentDetailScreen} />
            <Stack.Screen name="MomentForm" component={MomentFormScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="Meow" component={MeowScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
