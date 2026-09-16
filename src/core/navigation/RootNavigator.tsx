import { ForgotPasswordScreen } from '@presentation/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '@presentation/auth/screens/LoginScreen';
import { RegisterScreen } from '@presentation/auth/screens/RegisterScreen';
import { CalendarEventDetailScreen } from '@presentation/calendar/screens/CalendarEventDetailScreen';
import { CalendarEventFormScreen } from '@presentation/calendar/screens/CalendarEventFormScreen';
import { CalendarScreen } from '@presentation/calendar/screens/CalendarScreen';
import { DashboardScreen } from '@presentation/dashboard/screens/DashboardScreen';
import { ExpenseDetailScreen } from '@presentation/expenses/screens/ExpenseDetailScreen';
import { ExpenseFormScreen } from '@presentation/expenses/screens/ExpenseFormScreen';
import { ExpensesScreen } from '@presentation/expenses/screens/ExpensesScreen';
import { CreateHouseholdScreen } from '@presentation/households/screens/CreateHouseholdScreen';
import { InventoryItemDetailScreen } from '@presentation/inventory/screens/InventoryItemDetailScreen';
import { InventoryListScreen } from '@presentation/inventory/screens/InventoryListScreen';
import { NotificationsListScreen } from '@presentation/notifications/screens/NotificationsListScreen';
import { PetDetailScreen } from '@presentation/pets/screens/PetDetailScreen';
import { PetFormScreen } from '@presentation/pets/screens/PetFormScreen';
import { PetsListScreen } from '@presentation/pets/screens/PetsListScreen';
import { SavingsGoalDetailScreen } from '@presentation/savings/screens/SavingsGoalDetailScreen';
import { SavingsGoalFormScreen } from '@presentation/savings/screens/SavingsGoalFormScreen';
import { SavingsScreen } from '@presentation/savings/screens/SavingsScreen';
import { ShoppingItemFormScreen } from '@presentation/shopping/screens/ShoppingItemFormScreen';
import { ShoppingListScreen } from '@presentation/shopping/screens/ShoppingListScreen';
import { SOSActivationScreen } from '@presentation/sos/screens/SOSActivationScreen';
import { TrustedContactsScreen } from '@presentation/sos/screens/TrustedContactsScreen';
import { TaskDetailScreen } from '@presentation/tasks/screens/TaskDetailScreen';
import { TaskFormScreen } from '@presentation/tasks/screens/TaskFormScreen';
import { TasksListScreen } from '@presentation/tasks/screens/TasksListScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = (): JSX.Element => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
            <Stack.Screen name="TasksList" component={TasksListScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
            <Stack.Screen name="ShoppingLists" component={ShoppingListScreen} />
            <Stack.Screen name="ShoppingItemForm" component={ShoppingItemFormScreen} />
            <Stack.Screen name="InventoryList" component={InventoryListScreen} />
            <Stack.Screen name="InventoryItemDetail" component={InventoryItemDetailScreen} />
            <Stack.Screen name="Expenses" component={ExpensesScreen} />
            <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
            <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
            <Stack.Screen name="Savings" component={SavingsScreen} />
            <Stack.Screen name="SavingsGoalDetail" component={SavingsGoalDetailScreen} />
            <Stack.Screen name="SavingsGoalForm" component={SavingsGoalFormScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="CalendarEventDetail" component={CalendarEventDetailScreen} />
            <Stack.Screen name="CalendarEventForm" component={CalendarEventFormScreen} />
            <Stack.Screen name="NotificationsList" component={NotificationsListScreen} />
            <Stack.Screen name="Pets" component={PetsListScreen} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} />
            <Stack.Screen name="PetForm" component={PetFormScreen} />
            <Stack.Screen name="SOSActivation" component={SOSActivationScreen} />
            <Stack.Screen name="TrustedContacts" component={TrustedContactsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
