import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input, Screen } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text } from 'react-native';
import { useForgotPassword } from '../hooks/useForgotPassword';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

/**
 * `Screen` owns the safe area, the scroll and the keyboard. The single field
 * plus the submit button is exactly the stack that used to end up under the
 * keyboard on a small phone (TD-043).
 */
export const ForgotPasswordScreen = ({ navigation }: Props): JSX.Element => {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    forgotPassword.mutate(email, {
      onSuccess: (data) => {
        navigation.navigate('ResetPasswordOtp', {
          email,
          verificationToken: data.verificationToken,
        });
      },
    });
  };

  return (
    <Screen align="center" keyboardAware dismissKeyboardOnTap gap={spacing.s4}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Te enviaremos un código a tu email</Text>
      <Input
        label="Email"
        type="email"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        required
        testID="forgot-email"
      />
      {forgotPassword.isError ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {forgotPassword.error.message}
        </Text>
      ) : null}
      {forgotPassword.isSuccess ? (
        <Text style={styles.success}>{forgotPassword.data.message}</Text>
      ) : null}
      <Button
        label="Enviar código"
        onPress={handleSubmit}
        loading={forgotPassword.isPending}
        variant="primaryTonal"
        size="lg"
        style={styles.stretch}
        accessibilityHint="Envía un código de recuperación a tu email"
        testID="forgot-submit"
      />
      <Button
        label="Volver a iniciar sesión"
        onPress={() => navigation.navigate('Login')}
        variant="linkNeutral"
      />
    </Screen>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  title: {
    ...typography.h2,
    color: theme.text,
    textAlign: 'center' as const,
  },
  subtitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  success: {
    ...typography.bodySmall,
    color: theme.success,
  },
  stretch: { alignSelf: 'stretch' as const },
});
