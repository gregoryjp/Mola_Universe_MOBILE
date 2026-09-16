import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TrustedContactRow } from '../components/TrustedContactRow';
import { useTrustedContacts } from '../hooks/useSos';
import { useCreateTrustedContact, useDeleteTrustedContact } from '../hooks/useSosMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TrustedContacts'>;

export const TrustedContactsScreen = (_props: Props): JSX.Element => {
  const contacts = useTrustedContacts();
  const createContact = useCreateTrustedContact();
  const deleteContact = useDeleteTrustedContact();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && !createContact.isPending;

  const submit = (): void => {
    if (!canSubmit) return;
    const trimmedPhone = phone.trim();
    createContact.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        ...(trimmedPhone.length > 0 && { phone: trimmedPhone }),
      },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setPhone('');
        },
      },
    );
  };

  const items = contacts.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Contactos de confianza</Text>
      <Text style={styles.hint}>
        Recibirán tu alerta SOS con tu mensaje cuando la actives. Deben verificar el email antes de
        poder recibirla.
      </Text>

      <View style={styles.section}>
        {contacts.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {contacts.isError ? <Text style={styles.error}>{contacts.error.message}</Text> : null}
        {items.map((contact) => (
          <TrustedContactRow
            key={contact.id}
            contact={contact}
            onDelete={() => deleteContact.mutate(contact.id)}
          />
        ))}
        {contacts.data && items.length === 0 ? (
          <Text style={styles.muted}>Todavía no tienes contactos de confianza</Text>
        ) : null}
        {deleteContact.isError ? (
          <Text style={styles.error}>{deleteContact.error.message}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Añadir contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono (opcional)"
          placeholderTextColor={colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        {createContact.isError ? (
          <Text style={styles.error}>{createContact.error.message}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
          disabled={!canSubmit}
          onPress={submit}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {createContact.isPending ? 'Añadiendo…' : 'Añadir contacto'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
