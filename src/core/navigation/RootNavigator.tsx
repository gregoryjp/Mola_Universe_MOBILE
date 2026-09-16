import { ForgotPasswordScreen } from '@presentation/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '@presentation/auth/screens/LoginScreen';
import { RegisterScreen } from '@presentation/auth/screens/RegisterScreen';
import { DashboardScreen } from '@presentation/dashboard/screens/DashboardScreen';
import { ExpenseDetailScreen } from '@presentation/expenses/screens/ExpenseDetailScreen';
import { ExpenseFormScreen } from '@presentation/expenses/screens/ExpenseFormScreen';
import { ExpensesScreen } from '@presentation/expenses/screens/ExpensesScreen';
import { CreateHouseholdScreen } from '@presentation/households/screens/CreateHouseholdScreen';
import { InventoryItemDetailScreen } from '@presentation/inventory/screens/InventoryItemDetailScreen';
import { InventoryListScreen } from '@presentation/inventory/screens/InventoryListScreen';
import { ShoppingItemFormScreen } from '@presentation/shopping/screens/ShoppingItemFormScreen';
import { ShoppingListScreen } from '@presentation/shopping/screens/ShoppingListScreen';
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
