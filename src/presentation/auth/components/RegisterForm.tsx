import { colors, spacing, typography } from '@core/theme';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegister } from '../hooks/useRegister';

export const RegisterForm = (): JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const register = useRegister();

  const handleSubmit = (): void => {
    register.mutate({ name, email, password, passwordConfirm });
  };

  return (
    <View style={styles.form}>
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
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Repite la contraseña"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
      />
      {register.isError ? <Text style={styles.error}>{register.error.message}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={register.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{register.isPending ? 'Creando…' : 'Crear cuenta'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing.sm,
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
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
