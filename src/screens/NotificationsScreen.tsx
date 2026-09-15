import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNotifications } from '../modules/notifications';

export function NotificationsScreen() {
  const { notifications, markRead } = useNotifications();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 && <Text style={styles.unreadBadge}>{unread} unread</Text>}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.notificationUnread]}
            onPress={() => markRead.mutate(item.id)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  unreadBadge: { fontSize: 12, color: '#007AFF', marginTop: 4 },
  list: { padding: 8 },
  notificationItem: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 8, marginVertical: 4, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  notificationUnread: { backgroundColor: '#f0f7ff' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: '#666', marginBottom: 8 },
  notificationTime: { fontSize: 12, color: '#999' },
  unreadDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF', marginLeft: 8, marginTop: 4 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#999' },
});
