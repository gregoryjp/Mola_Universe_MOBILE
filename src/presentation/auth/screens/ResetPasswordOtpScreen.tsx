import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, OtpInput } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useForgotPassword } from '../hooks/useForgotPassword';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPasswordOtp'>;

const CODE_LENGTH = 6;
/**
 * The real backend limit on `/auth/forgot-password` (confirmed in
 * `shared/middleware/rateLimiter.ts`) is `emailLimiter`: 3 requests per rolling
 * hour, per IP — not a per-attempt cooldown, and there is no header/response
 * field that exposes "seconds until the next allowed request". This 30s value
 * is a client-side soft throttle only, to stop rapid double-taps; it does not
 * and cannot mirror the real window. The server's 429 (surfaced via
 * `resend.error.message`) is the actual enforcement once the 3/hour cap is
 * hit — flag for review if a different soft-throttle value is wanted.
 */
const RESEND_COOLDOWN_SECONDS = 30;

export const ResetPasswordOtpScreen = ({ navigation, route }: Props): JSX.Element => {
  const { email } = route.params;
  const [verificationToken, setVerificationToken] = useState(route.params.verificationToken);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const resend = useForgotPassword();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = (): void => {
    resend.mutate(email, {
      onSuccess: (data) => {
        // A resend returns a fresh verificationToken; the stale one no longer
        // validates against the backend, so it must be replaced, not reused.
        setVerificationToken(data.verificationToken);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });
  };

  const handleContinue = (): void => {
    navigation.navigate('ResetPassword', { email, verificationToken, code });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifica tu código</Text>
      <Text style={styles.subtitle}>Enviamos un código de 6 dígitos a {email}</Text>
      <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} testID="reset-otp" />
      {resend.isError ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {resend.error.message}
        </Text>
      ) : null}
      <Button
        label={cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
        onPress={handleResend}
        variant="linkNeutral"
        disabled={cooldown > 0}
        loading={resend.isPending}
        testID="reset-otp-resend"
      />
      <Button
        label="Continuar"
        onPress={handleContinue}
        variant="primaryTonal"
        size="lg"
        style={styles.stretch}
        disabled={code.length !== CODE_LENGTH}
        accessibilityHint="Continúa hacia la nueva contraseña"
        testID="reset-otp-continue"
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
    textAlign: 'center' as const,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  stretch: { alignSelf: 'stretch' as const },
});
