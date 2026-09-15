import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { ConsentStatus, UpdateConsentRequest } from '../interface/types';

interface ConsentPanelProps {
  consent?: ConsentStatus;
  isLoading?: boolean;
  onUpdate: (data: UpdateConsentRequest) => void;
}

export function ConsentPanel({
  consent,
  isLoading = false,
  onUpdate,
}: ConsentPanelProps) {
  const [localConsent, setLocalConsent] = useState(consent);

  useEffect(() => {
    setLocalConsent(consent);
  }, [consent]);

  const handleToggle = (key: keyof ConsentStatus) => {
    if (!localConsent || key === 'lastUpdated') return;

    const updated = { ...localConsent, [key]: !localConsent[key] };
    setLocalConsent(updated);
    onUpdate({ [key]: !localConsent[key] });
  };

  if (!localConsent) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading consent settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Consent</Text>
        <Text style={styles.sectionDescription}>
          Manage how your data is used and shared
        </Text>

        <View style={styles.consentItem}>
          <View style={styles.consentContent}>
            <Text style={styles.consentLabel}>Marketing Communications</Text>
            <Text style={styles.consentDescription}>
              Receive personalized offers and news
            </Text>
          </View>
          <Switch
            value={localConsent.marketing}
            onValueChange={() => handleToggle('marketing')}
            disabled={isLoading}
          />
        </View>

        <View style={styles.consentItem}>
          <View style={styles.consentContent}>
            <Text style={styles.consentLabel}>Analytics & Improvements</Text>
            <Text style={styles.consentDescription}>
              Help us improve the app with usage data
            </Text>
          </View>
          <Switch
            value={localConsent.analytics}
            onValueChange={() => handleToggle('analytics')}
            disabled={isLoading}
          />
        </View>

        <View style={styles.consentItem}>
          <View style={styles.consentContent}>
            <Text style={styles.consentLabel}>Third-Party Services</Text>
            <Text style={styles.consentDescription}>
              Share data with trusted partners
            </Text>
          </View>
          <Switch
            value={localConsent.thirdParty}
            onValueChange={() => handleToggle('thirdParty')}
            disabled={isLoading}
          />
        </View>

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated:{' '}
            {new Date(localConsent.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Your Rights</Text>
        <Text style={styles.infoText}>
          You have the right to access, correct, or delete your personal data.
          Visit our Privacy Policy for more information.
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
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  consentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  consentContent: {
    flex: 1,
    marginRight: 12,
  },
  consentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 13,
    color: '#999',
  },
  lastUpdated: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
