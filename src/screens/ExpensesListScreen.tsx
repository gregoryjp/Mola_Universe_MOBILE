import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useExpenses } from '../modules/expenses';

interface ExpensesListScreenProps {
  householdId: string;
}

export function ExpensesListScreen({ householdId }: ExpensesListScreenProps) {
  const { expenses, create } = useExpenses(householdId);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');

  const handleCreate = () => {
    if (!desc.trim() || !amt.trim()) {
      Alert.alert('Error', 'Description and amount required');
      return;
    }
    create.mutate({
      householdId,
      description: desc,
      amount: parseFloat(amt),
      category: 'other',
      paidBy: 'current-user',
      date: new Date().toISOString(),
      status: 'pending',
    } as any);
    setDesc('');
    setAmt('');
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pending = expenses.filter((e) => e.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={styles.summaryValue}>{pending}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={desc}
          onChangeText={setDesc}
          editable={!create.isPending}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amt}
          onChangeText={setAmt}
          keyboardType="decimal-pad"
          editable={!create.isPending}
        />
        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={create.isPending}>
          <Text style={styles.btnText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemAmt}>${item.amount.toFixed(2)}</Text>
              <View style={[styles.status, item.status === 'pending' ? styles.statusPending : styles.statusSettled]}>
                <Text style={styles.statusText}>{item.status === 'pending' ? 'P' : 'S'}</Text>
              </View>
            </View>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  summary: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, gap: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#999' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#FF3B30', marginTop: 4 },
  form: { backgroundColor: '#fff', padding: 16, gap: 12, marginVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 8 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemInfo: { flex: 1 },
  itemDesc: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#999' },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  itemAmt: { fontSize: 16, fontWeight: 'bold', color: '#FF3B30' },
  status: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statusPending: { backgroundColor: '#FFF3CD' },
  statusSettled: { backgroundColor: '#D4EDDA' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
});
