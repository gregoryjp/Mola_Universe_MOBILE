import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { getHouseholdExpenses, settleExpense } from '../api/expenses';
import { getMyHouseholds } from '../api/households';
import { ExpenseEntity, HouseholdEntity } from '../types/entities';

export function ExpensesScreen() {
  const [households, setHouseholds] = useState<HouseholdEntity[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntity[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadExpenses();
    }
  }, [selectedHouseholdId]);

  const loadHouseholds = async () => {
    setLoading(true);
    try {
      const data = await getMyHouseholds();
      setHouseholds(data);
      if (data.length > 0) {
        setSelectedHouseholdId(data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    if (!selectedHouseholdId) return;
    try {
      const data = await getHouseholdExpenses(selectedHouseholdId);
      setExpenses(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
    }
  };

  const handleSettleExpense = async (expenseId: string) => {
    try {
      await settleExpense(expenseId);
      setExpenses(expenses.filter((e) => e.id !== expenseId));
      Alert.alert('Success', 'Expense settled');
    } catch (error) {
      Alert.alert('Error', 'Failed to settle expense');
    }
  };

  const totalAmount = expenses
    .filter((e) => e.status === 'PENDING')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const pendingExpenses = expenses.filter((e) => e.status === 'PENDING');
  const settledExpenses = expenses.filter((e) => e.status === 'SETTLED');

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.stats}>{households.length} households</Text>
      </View>

      {households.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>No households</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={households}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.householdTab,
                  selectedHouseholdId === item.id && styles.householdTabActive,
                ]}
                onPress={() => setSelectedHouseholdId(item.id)}
              >
                <Text
                  style={[
                    styles.householdTabText,
                    selectedHouseholdId === item.id && styles.householdTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.householdTabs}
          />

          {pendingExpenses.length > 0 && (
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={styles.summaryAmount}>
                  {totalAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={styles.summaryValue}>{pendingExpenses.length}</Text>
              </View>
            </View>
          )}

          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.expenseItem,
                  item.status === 'SETTLED' && styles.expenseItemSettled,
                ]}
              >
                <View style={styles.expenseContent}>
                  <Text style={styles.expenseDescription}>{item.description}</Text>
                  <View style={styles.expenseMetaRow}>
                    <Text style={styles.expenseCategory}>{item.category}</Text>
                    <Text style={styles.expenseDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>
                    {item.currency} {item.amount}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'PENDING'
                        ? styles.statusPending
                        : styles.statusSettled,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {item.status === 'PENDING' ? '⏳' : '✓'}
                    </Text>
                  </View>
                </View>

                {item.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.settleButton}
                    onPress={() => handleSettleExpense(item.id)}
                  >
                    <Text style={styles.settleButtonText}>Settle</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListIcon}>📊</Text>
                <Text style={styles.emptyListText}>No expenses</Text>
              </View>
            }
            scrollEnabled={true}
            style={styles.list}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  stats: {
    fontSize: 14,
    color: '#999',
  },
  householdTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  householdTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  householdTabActive: {
    backgroundColor: '#007AFF',
  },
  householdTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  householdTabTextActive: {
    color: '#fff',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  list: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseItemSettled: {
    opacity: 0.7,
  },
  expenseContent: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  expenseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  expenseRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusSettled: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settleButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  settleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  emptyListContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyListIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
