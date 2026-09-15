import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useShopping } from '../modules/shopping';

interface ShoppingListScreenProps {
  householdId: string;
  listId: string;
}

export function ShoppingListScreen({ householdId, listId }: ShoppingListScreenProps) {
  const { items, addItem } = useShopping(householdId, listId);
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('1');

  const handleAdd = () => {
    if (itemName.trim()) {
      addItem.mutate({ name: itemName, quantity: parseInt(qty) || 1, purchased: false } as any);
      setItemName('');
      setQty('1');
    }
  };

  const purchased = items.filter((i) => i.purchased).length;
  const total = items.length;

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>{purchased}/{total} items</Text>
        <View style={styles.progressBar}>
          <View style={{ ...styles.progressFill, width: `${total > 0 ? (purchased / total) * 100 : 0}%` }} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Item name"
          value={itemName}
          onChangeText={setItemName}
          editable={!addItem.isPending}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={addItem.isPending}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, item.purchased && styles.itemDone]}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  progress: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  progressText: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34C759' },
  inputGroup: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12 },
  addBtn: { paddingHorizontal: 20, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
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
  itemDone: { opacity: 0.5 },
  itemName: { fontSize: 16, fontWeight: '500', color: '#000' },
  itemQty: { fontSize: 14, color: '#999' },
});
