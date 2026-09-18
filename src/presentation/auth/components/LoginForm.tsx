import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLogin } from '../hooks/useLogin';

export const LoginForm = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    login.mutate({ email, password });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        testID="login-email"
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        testID="login-password"
      />
      {login.isError ? <Text style={styles.error}>{login.error.message}</Text> : null}
      <Button
        label="Entrar"
        onPress={handleSubmit}
        loading={login.isPending}
        variant="primaryTonal"
        size="lg"
        accessibilityHint="Inicia sesión con tu email y contraseña"
        testID="login-submit"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  form: {
    width: '100%' as const,
    gap: spacing.s4,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
