import { CalendarScreen } from '@presentation/calendar/screens/CalendarScreen';
import { DashboardScreen } from '@presentation/dashboard/screens/DashboardScreen';
import { ExpensesScreen } from '@presentation/expenses/screens/ExpensesScreen';
import { ShoppingListScreen } from '@presentation/shopping/screens/ShoppingListScreen';
import { TasksListScreen } from '@presentation/tasks/screens/TasksListScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { JSX } from 'react';
import { FloatingTabBar } from './FloatingTabBar';
import type { MainTabParamList } from './types';

const Tabs = createBottomTabNavigator<MainTabParamList>();

/**
 * The tab screens render their own in-screen heading, so the native header stays
 * off here to avoid two stacked titles (GAP 4).
 */
export const MainTabs = (): JSX.Element => (
  <Tabs.Navigator
    tabBar={(props) => <FloatingTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tabs.Screen name="Dashboard" component={DashboardScreen} />
    <Tabs.Screen name="TasksList" component={TasksListScreen} />
    <Tabs.Screen name="ShoppingLists" component={ShoppingListScreen} />
    <Tabs.Screen name="Expenses" component={ExpensesScreen} />
    <Tabs.Screen name="Calendar" component={CalendarScreen} />
  </Tabs.Navigator>
);
