import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { DataExportRequest, DeleteAccountRequest } from '../interface/types';

interface DataRightsPanelProps {
  isExportingData?: boolean;
  isDeletingAccount?: boolean;
  onRequestDataExport: (data: DataExportRequest) => void;
  onRequestDeleteAccount: (data: DeleteAccountRequest) => void;
}

export function DataRightsPanel({
  isExportingData = false,
  isDeletingAccount = false,
  onRequestDataExport,
  onRequestDeleteAccount,
}: DataRightsPanelProps) {
  const [password, setPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleExportData = (format: 'json' | 'csv') => {
    Alert.alert(
      'Export Your Data',
      `Your data will be exported as ${format.toUpperCase()} and sent to your email.`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Export',
          onPress: () => {
            onRequestDataExport({
              format,
              includeMedia: true,
            });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!deleteConfirm) {
      Alert.alert('Error', 'Please confirm account deletion');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          onPress: () => setDeleteConfirm(false),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            onRequestDeleteAccount({
              password,
              reason: 'User requested deletion',
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Data Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Your Data</Text>
        <Text style={styles.sectionDescription}>
          Download a copy of your data in a standard format
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isExportingData && styles.buttonDisabled]}
          onPress={() => handleExportData('json')}
          disabled={isExportingData || isDeletingAccount}
        >
          {isExportingData ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Export as JSON</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isExportingData && styles.buttonDisabled]}
          onPress={() => handleExportData('csv')}
          disabled={isExportingData || isDeletingAccount}
        >
          {isExportingData ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Export as CSV</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          📧 A download link will be sent to your email. Files expire after 7 days.
        </Text>
      </View>

      {/* Account Deletion Section */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.sectionTitle}>Delete Account</Text>
        <Text style={styles.sectionDescription}>
          Permanently delete your account and all associated data
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            This action is permanent and cannot be undone. All your data will be
            deleted within 30 days.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton, isDeletingAccount && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount || isExportingData}
        >
          {isDeletingAccount ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.confirmBox}>
          <Text style={styles.confirmLabel}>
            I understand this cannot be undone. Confirm deletion:
          </Text>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              deleteConfirm && styles.confirmButtonActive,
            ]}
            onPress={() => setDeleteConfirm(!deleteConfirm)}
            disabled={isDeletingAccount}
          >
            <Text
              style={[
                styles.confirmButtonText,
                deleteConfirm && styles.confirmButtonTextActive,
              ]}
            >
              {deleteConfirm ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerSection: {
    backgroundColor: '#fff5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  confirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmLabel: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonActive: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  confirmButtonTextActive: {
    color: '#fff',
  },
});
