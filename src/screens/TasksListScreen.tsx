import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTasks } from '../modules/tasks';
import { Task } from '../modules/tasks/interface/types';

interface TasksListScreenProps {
  householdId: string;
}

export function TasksListScreen({ householdId }: TasksListScreenProps) {
  const { tasks, isLoading, createTask, updateTask } = useTasks(householdId);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }
    createTask.mutate({
      householdId,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    } as any);
    setNewTaskTitle('');
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask.mutate({
      id: task.id,
      status: newStatus as any,
    } as any);
  };

  const todoTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.createBar}>
        <Text style={styles.createLabel}>New Task:</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTask}
          disabled={createTask.isPending}
        >
          <Text style={styles.createButtonText}>
            {createTask.isPending ? '...' : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          ...todoTasks.map((t) => ({ ...t, section: 'todo' })),
          ...doneTasks.map((t) => ({ ...t, section: 'done' })),
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.taskItem,
              item.status === 'done' && styles.taskItemDone,
            ]}
            onPress={() => handleToggleStatus(item as any)}
          >
            <View
              style={[
                styles.checkbox,
                item.status === 'done' && styles.checkboxActive,
              ]}
            >
              {item.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.status === 'done' && styles.taskTitleDone,
                ]}
              >
                {item.title}
              </Text>
              {item.dueDate && (
                <Text style={styles.dueDate}>
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.priorityBadge,
                item.priority === 'high' && styles.priorityHigh,
              ]}
            >
              <Text style={styles.priorityText}>{item.priority[0]}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
          </View>
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  createLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  taskItemDone: {
    opacity: 0.6,
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
  checkboxActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskTitleDone: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  priorityHigh: {
    backgroundColor: '#FF3B30',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
