import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useHouseholds } from '../modules/households';

interface HouseholdSelectScreenProps {
  onSelect: (householdId: string) => void;
}

export function HouseholdSelectScreen({ onSelect }: HouseholdSelectScreenProps) {
  const { households, create } = useHouseholds();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Household name required');
      return;
    }
    create.mutate(
      { name: newName, description: '' },
      {
        onSuccess: (data: any) => {
          Alert.alert('Success', 'Household created');
          onSelect(data.id);
          setNewName('');
          setShowCreate(false);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Household</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Text style={styles.createBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Household name"
            value={newName}
            onChangeText={setNewName}
            editable={!create.isPending}
          />
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreate}
            disabled={create.isPending}
          >
            <Text style={styles.submitBtnText}>
              {create.isPending ? '...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={households}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.householdItem}
            onPress={() => onSelect(item.id)}
          >
            <View style={styles.householdInfo}>
              <Text style={styles.householdName}>{item.name}</Text>
              <Text style={styles.householdMembers}>{item.memberCount} members</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
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
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  createForm: { backgroundColor: '#fff', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  submitBtn: { backgroundColor: '#007AFF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 8 },
  householdItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginHorizontal: 8, marginVertical: 8, borderRadius: 8 },
  householdInfo: { flex: 1 },
  householdName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  householdMembers: { fontSize: 14, color: '#999' },
  arrow: { fontSize: 24, color: '#007AFF', fontWeight: 'bold' },
});
