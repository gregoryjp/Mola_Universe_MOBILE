import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSavings } from '../modules/savings';

interface SavingsGoalsScreenProps {
  householdId: string;
}

export function SavingsGoalsScreen({ householdId }: SavingsGoalsScreenProps) {
  const { goals, create } = useSavings(householdId);
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [target, setTarget] = useState('');

  const handleCreate = () => {
    if (!goalName.trim() || !target.trim()) {
      Alert.alert('Error', 'Goal name and target required');
      return;
    }
    create.mutate(
      {
        householdId,
        name: goalName,
        targetAmount: parseFloat(target),
        currentAmount: 0,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      } as any,
      {
        onSuccess: () => {
          setGoalName('');
          setTarget('');
          setShowForm(false);
        },
      }
    );
  };

  const getProgress = (goal: any) => {
    return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Savings Goals</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Goal name"
            value={goalName}
            onChangeText={setGoalName}
          />
          <TextInput
            style={styles.input}
            placeholder="Target amount"
            value={target}
            onChangeText={setTarget}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={create.isPending}>
            <Text style={styles.submitBtnText}>{create.isPending ? '...' : 'Create Goal'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalStatus}>{item.status === 'active' ? '🎯' : '✅'}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={{ ...styles.progressFill, width: `${Math.min(getProgress(item), 100)}%` }} />
            </View>
            <View style={styles.goalFooter}>
              <Text style={styles.goalAmount}>${item.currentAmount.toFixed(2)}/${item.targetAmount.toFixed(2)}</Text>
              <Text style={styles.goalPercent}>{Math.round(getProgress(item))}%</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 16, gap: 8, marginVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  submitBtn: { backgroundColor: '#34C759', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 8 },
  goalCard: { backgroundColor: '#fff', padding: 16, marginHorizontal: 8, marginVertical: 8, borderRadius: 8 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalName: { fontSize: 16, fontWeight: '600', color: '#000' },
  goalStatus: { fontSize: 20 },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#34C759' },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalAmount: { fontSize: 14, color: '#666' },
  goalPercent: { fontSize: 14, fontWeight: '600', color: '#34C759' },
});
