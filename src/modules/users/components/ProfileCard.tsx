import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { User } from '../interface/types';

interface ProfileCardProps {
  user?: User;
  isLoading?: boolean;
  onEditPress?: () => void;
}

export function ProfileCard({
  user,
  isLoading = false,
  onEditPress,
}: ProfileCardProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {onEditPress && (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonText}>✎</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {user.phone && <Text style={styles.phone}>{user.phone}</Text>}

      {user.birthDate && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Birthday:</Text>
          <Text style={styles.value}>
            {new Date(user.birthDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusBadge,
              user.emailVerified
                ? styles.statusVerified
                : styles.statusUnverified,
            ]}
          >
            <Text style={styles.statusText}>
              {user.emailVerified ? '✓' : '○'} Email
            </Text>
          </View>
        </View>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusBadge,
              user.phoneVerified
                ? styles.statusVerified
                : styles.statusUnverified,
            ]}
          >
            <Text style={styles.statusText}>
              {user.phoneVerified ? '✓' : '○'} Phone
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  phone: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusItem: {
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusVerified: {
    backgroundColor: '#D4EDDA',
  },
  statusUnverified: {
    backgroundColor: '#FFF3CD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
