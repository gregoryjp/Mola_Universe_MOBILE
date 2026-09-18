import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useForgotPassword } from '../hooks/useForgotPassword';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

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
    <View style={styles.container}>
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
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.background,
    padding: spacing.s6,
    gap: spacing.s4,
  },
  title: {
    ...typography.h2,
    color: theme.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
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
