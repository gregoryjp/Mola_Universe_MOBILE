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
  TextInput,
} from 'react-native';
import {
  listPersonalShoppingLists,
  createShoppingList,
  addShoppingListItem,
  toggleShoppingListItem,
} from '../api/shopping';
import { ShoppingListEntity, ShoppingItemEntity } from '../types/entities';

export function ShoppingScreen() {
  const [lists, setLists] = useState<ShoppingListEntity[]>([]);
  const [items, setItems] = useState<ShoppingItemEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setLoading(true);
    try {
      const data = await listPersonalShoppingLists();
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load shopping lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    try {
      const list = await createShoppingList(newListName);
      setLists([...lists, list]);
      setSelectedListId(list.id);
      setNewListName('');
      Alert.alert('Success', 'List created');
    } catch (error) {
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const handleAddItem = async () => {
    if (!selectedListId || !newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    try {
      const item = await addShoppingListItem(selectedListId, {
        name: newItemName,
      });
      setItems([...items, item]);
      setNewItemName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string, currentStatus: string) => {
    if (!selectedListId) return;

    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await toggleShoppingListItem(selectedListId, itemId, newStatus);
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  const selectedList = lists.find((l) => l.id === selectedListId);
  const completedItems = items.filter((i) => i.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping</Text>
        <Text style={styles.stats}>{lists.length} lists</Text>
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>No shopping lists</Text>
          <View style={styles.createNewContainer}>
            <TextInput
              style={styles.newListInput}
              placeholder="List name..."
              value={newListName}
              onChangeText={setNewListName}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateList}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listTab,
                  selectedListId === item.id && styles.listTabActive,
                ]}
                onPress={() => setSelectedListId(item.id)}
              >
                <Text
                  style={[
                    styles.listTabText,
                    selectedListId === item.id && styles.listTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.listTabs}
          />

          {selectedList && (
            <View style={styles.listHeader}>
              <Text style={styles.listName}>{selectedList.name}</Text>
              <View style={styles.listStats}>
                <Text style={styles.listStatText}>
                  {completedItems}/{items.length}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add item..."
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => handleToggleItem(item.id, item.status)}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.status === 'COMPLETED' && styles.checkboxChecked,
                  ]}
                >
                  {item.status === 'COMPLETED' && (
                    <Text style={styles.checkboxText}>✓</Text>
                  )}
                </View>
                <View style={styles.itemContent}>
                  <Text
                    style={[
                      styles.itemName,
                      item.status === 'COMPLETED' && styles.itemNameCompleted,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={true}
            style={styles.itemsList}
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
  listTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  listTabActive: {
    backgroundColor: '#007AFF',
  },
  listTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listTabTextActive: {
    color: '#fff',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  listStats: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  addItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemsList: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkboxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemNotes: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  createNewContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  newListInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
