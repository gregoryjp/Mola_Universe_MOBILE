import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRegister } from '../hooks/useRegister';

export const RegisterForm = (): JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const register = useRegister();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    register.mutate({ name, email, password, passwordConfirm });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        testID="register-name"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        testID="register-email"
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        testID="register-password"
      />
      <Input
        label="Repite la contraseña"
        type="password"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        placeholder="Repite la contraseña"
        testID="register-password-confirm"
      />
      {register.isError ? <Text style={styles.error}>{register.error.message}</Text> : null}
      <Button
        label="Crear cuenta"
        onPress={handleSubmit}
        loading={register.isPending}
        variant="primaryTonal"
        size="lg"
        accessibilityHint="Crea tu cuenta con nombre, email y contraseña"
        testID="register-submit"
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
