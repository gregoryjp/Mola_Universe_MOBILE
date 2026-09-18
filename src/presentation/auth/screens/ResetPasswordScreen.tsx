import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useResetPassword } from '../hooks/useResetPassword';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

/** Backend rule confirmed in openapi.ts: `newPassword` has `minLength: 8`. */
const MIN_PASSWORD_LENGTH = 8;

export const ResetPasswordScreen = ({ navigation, route }: Props): JSX.Element => {
  const { verificationToken, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const resetPassword = useResetPassword();
  const styles = useThemedStyles(makeStyles);

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit = newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    resetPassword.mutate(
      { verificationToken, code, newPassword },
      { onSuccess: () => navigation.replace('ResetPasswordSuccess') },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea tu nueva contraseña</Text>
      <Input
        label="Nueva contraseña"
        type="password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Mínimo 8 caracteres"
        error={tooShort ? 'Debe tener al menos 8 caracteres' : undefined}
        required
        testID="reset-password-new"
      />
      <Input
        label="Repite la contraseña"
        type="password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repite la contraseña"
        error={mismatch ? 'Las contraseñas no coinciden' : undefined}
        required
        testID="reset-password-confirm"
      />
      {resetPassword.isError ? (
        <>
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {resetPassword.error.message}
          </Text>
          <Button
            label="Volver a introducir el código"
            onPress={() => navigation.goBack()}
            variant="linkNeutral"
            testID="reset-password-back"
          />
        </>
      ) : null}
      <Button
        label="Restablecer contraseña"
        onPress={handleSubmit}
        loading={resetPassword.isPending}
        disabled={!canSubmit}
        variant="primaryTonal"
        size="lg"
        style={styles.stretch}
        accessibilityHint="Guarda tu nueva contraseña"
        testID="reset-password-submit"
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
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  stretch: { alignSelf: 'stretch' as const },
});
