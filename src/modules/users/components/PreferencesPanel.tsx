import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { UserPreferences, UpdatePreferencesRequest } from '../interface/types';

interface PreferencesPanelProps {
  preferences?: UserPreferences;
  isLoading?: boolean;
  onUpdate: (data: UpdatePreferencesRequest) => void;
}

export function PreferencesPanel({
  preferences,
  isLoading = false,
  onUpdate,
}: PreferencesPanelProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setLocalPrefs((prev) => (prev ? { ...prev, theme } : undefined));
    onUpdate({ theme });
  };

  const handleLanguageChange = (lang: 'en' | 'es' | 'fr' | 'pt') => {
    setLocalPrefs((prev) => (prev ? { ...prev, language: lang } : undefined));
    onUpdate({ language: lang });
  };

  const handleNotificationToggle = (key: keyof UserPreferences['notifications']) => {
    if (!localPrefs) return;
    const updated = {
      ...localPrefs.notifications,
      [key]: !localPrefs.notifications[key],
    };
    setLocalPrefs((prev) => (prev ? { ...prev, notifications: updated } : undefined));
    onUpdate({ notifications: updated });
  };

  const handlePrivacyToggle = (key: keyof UserPreferences['privacy']) => {
    if (!localPrefs) return;
    const updated = {
      ...localPrefs.privacy,
      [key]: !localPrefs.privacy[key],
    };
    setLocalPrefs((prev) => (prev ? { ...prev, privacy: updated } : undefined));
    onUpdate({ privacy: updated });
  };

  if (!localPrefs) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.optionGroup}>
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.option,
                localPrefs.theme === theme && styles.optionActive,
              ]}
              onPress={() => handleThemeChange(theme)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.optionText,
                  localPrefs.theme === theme && styles.optionTextActive,
                ]}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.optionGroup}>
          {(['en', 'es', 'fr', 'pt'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.option,
                localPrefs.language === lang && styles.optionActive,
              ]}
              onPress={() => handleLanguageChange(lang)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.optionText,
                  localPrefs.language === lang && styles.optionTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.toggleGroup}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Switch
              value={localPrefs.notifications.push}
              onValueChange={() => handleNotificationToggle('push')}
              disabled={isLoading}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Email</Text>
            <Switch
              value={localPrefs.notifications.email}
              onValueChange={() => handleNotificationToggle('email')}
              disabled={isLoading}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>SMS</Text>
            <Switch
              value={localPrefs.notifications.sms}
              onValueChange={() => handleNotificationToggle('sms')}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.toggleGroup}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Show Birth Date</Text>
            <Switch
              value={localPrefs.privacy.showBirthDate}
              onValueChange={() => handlePrivacyToggle('showBirthDate')}
              disabled={isLoading}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Show Phone Number</Text>
            <Switch
              value={localPrefs.privacy.showPhoneNumber}
              onValueChange={() => handlePrivacyToggle('showPhoneNumber')}
              disabled={isLoading}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Share Activity Status</Text>
            <Switch
              value={localPrefs.privacy.shareActivityStatus}
              onValueChange={() => handlePrivacyToggle('shareActivityStatus')}
              disabled={isLoading}
            />
          </View>
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
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  optionTextActive: {
    color: '#fff',
  },
  toggleGroup: {
    gap: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
