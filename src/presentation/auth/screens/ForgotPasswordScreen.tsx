import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForgotPassword } from '../hooks/useForgotPassword';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props): JSX.Element => {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = (): void => {
    forgotPassword.mutate(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Te enviaremos un código a tu email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {forgotPassword.isError ? (
        <Text style={styles.error}>{forgotPassword.error.message}</Text>
      ) : null}
      {forgotPassword.isSuccess ? (
        <Text style={styles.success}>{forgotPassword.data.message}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={forgotPassword.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {forgotPassword.isPending ? 'Enviando…' : 'Enviar código'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Volver a iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
    width: '100%',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  success: {
    ...typography.bodySmall,
    color: colors.success,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});
