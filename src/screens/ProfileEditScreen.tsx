import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUsers } from '../modules/users';

interface ProfileEditScreenProps {
  householdId?: string;
  onSave?: () => void;
}

export function ProfileEditScreen({ onSave }: ProfileEditScreenProps) {
  const { profile, updateProfile, isUpdatingProfile } = useUsers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setBirthDate(profile.birthDate || '');
    }
  }, [profile]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    updateProfile.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        birthDate: birthDate.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated');
          onSave?.();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      }
    );
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          editable={!isUpdatingProfile}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!isUpdatingProfile}
        />

        <Text style={styles.label}>Birth Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
          editable={!isUpdatingProfile}
        />

        <TouchableOpacity
          style={[styles.button, isUpdatingProfile && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Email Verified</Text>
        <Text style={styles.infoValue}>
          {profile.emailVerified ? '✅ Yes' : '⚠️ Not verified'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Account Created</Text>
        <Text style={styles.infoValue}>
          {new Date(profile.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
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
  form: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 16,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
