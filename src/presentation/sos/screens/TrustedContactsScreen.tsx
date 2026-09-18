import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Input, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TrustedContactRow } from '../components/TrustedContactRow';
import { useTrustedContacts } from '../hooks/useSos';
import {
  useCreateTrustedContact,
  useDeleteTrustedContact,
  useResendContactInvite,
} from '../hooks/useSosMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TrustedContacts'>;

export const TrustedContactsScreen = ({ navigation }: Props): JSX.Element => {
  const contacts = useTrustedContacts();
  const createContact = useCreateTrustedContact();
  const deleteContact = useDeleteTrustedContact();
  const resendInvite = useResendContactInvite();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const styles = useThemedStyles(makeStyles);

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
      <ScreenHeader
        title="Contactos de confianza"
        onBack={() => navigation.goBack()}
        testID="trusted-contacts-header"
      />
      <Text style={styles.hint}>
        Estas personas recibirán tu alerta SOS: por push si usan MOLA y tienen los avisos activos,
        por email en caso contrario.
      </Text>

      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        required
        testID="trusted-contact-name"
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        type="email"
        keyboardType="email-address"
        autoCapitalize="none"
        required
        testID="trusted-contact-email"
      />
      <Input
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        placeholder="Teléfono (opcional)"
        keyboardType="phone-pad"
        testID="trusted-contact-phone"
      />

      {createContact.isError ? (
        <Text style={styles.error}>{createContact.error.message}</Text>
      ) : null}

      <Button
        label="Añadir contacto"
        onPress={submit}
        disabled={!canSubmit}
        loading={createContact.isPending}
        size="lg"
        accessibilityHint="Añade el contacto a tu lista de confianza"
        testID="trusted-contact-submit"
      />

      {contacts.isLoading ? <Spinner /> : null}
      {contacts.isError ? <Text style={styles.error}>{contacts.error.message}</Text> : null}
      {deleteContact.isError ? (
        <Text style={styles.error}>{deleteContact.error.message}</Text>
      ) : null}
      {resendInvite.isError ? <Text style={styles.error}>{resendInvite.error.message}</Text> : null}
      {resendInvite.isSuccess ? (
        <Text style={styles.confirmation}>
          Invitación reenviada. Le llegará un correo nuevo con un enlace válido.
        </Text>
      ) : null}

      <View style={styles.list}>
        {items.map((contact) => (
          <TrustedContactRow
            key={contact.id}
            contact={contact}
            onDelete={() => deleteContact.mutate(contact.id)}
            onResendInvite={() => resendInvite.mutate(contact.id)}
            isResending={resendInvite.isPending && resendInvite.variables === contact.id}
          />
        ))}
        {contacts.data && items.length === 0 ? (
          <EmptyState title="Sin contactos de confianza todavía" />
        ) : null}
      </View>
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s2,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  list: {
    gap: spacing.s2,
    marginTop: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  confirmation: {
    ...typography.bodySmall,
    color: theme.text,
  },
});
