import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, OtpInput } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { useLogout } from '../hooks/useLogout';
import { useResendVerification } from '../hooks/useResendVerification';
import { useVerifyOtp } from '../hooks/useVerifyOtp';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;

/**
 * `AUTH_INVALID_CREDENTIALS` is the same code `/auth/login` returns for bad
 * credentials, so `error.message` literally reads "Invalid email or password"
 * here — nonsense on an OTP screen. Every other code renders `error.message`
 * as-is, matching ForgotPasswordScreen/ResetPasswordScreen.
 */
const ERROR_COPY_OVERRIDES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Código incorrecto, inténtalo de nuevo',
  AUTH_OTP_EXPIRED: 'El código ha caducado. Solicita uno nuevo.',
  AUTH_OTP_BLOCKED: 'Has agotado los intentos para este código. Solicita uno nuevo.',
  NETWORK_ERROR: 'No pudimos verificar el código. Revisa tu conexión e inténtalo de nuevo.',
  RATE_LIMITED: 'Has realizado demasiados intentos. Inténtalo más tarde.',
};

const INVALID_CHALLENGE_CODES = new Set(['AUTH_OTP_EXPIRED', 'AUTH_OTP_BLOCKED']);

const secondsUntil = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  const expiresAtMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtMs)) return null;
  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1_000));
};

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export const VerifyEmailScreen = ({ navigation }: Props): JSX.Element => {
  const user = useAuthStore((state) => state.user);
  const verificationToken = useAuthStore((state) => state.verificationToken);
  const verificationExpiresAt = useAuthStore((state) => state.verificationExpiresAt);
  const [code, setCode] = useState('');
  const [focusRequestKey, setFocusRequestKey] = useState<number>();
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    secondsUntil(verificationExpiresAt),
  );
  const verifyOtp = useVerifyOtp();
  const resendVerification = useResendVerification();
  const logout = useLogout();
  const styles = useThemedStyles(makeStyles);
  const previousRemainingRef = useRef<number | null>(remainingSeconds);

  useEffect(() => {
    previousRemainingRef.current = secondsUntil(verificationExpiresAt);
    setRemainingSeconds(previousRemainingRef.current);

    if (previousRemainingRef.current === null || previousRemainingRef.current === 0) {
      return;
    }

    const interval = setInterval(() => {
      const next = secondsUntil(verificationExpiresAt);
      const previous = previousRemainingRef.current;
      previousRemainingRef.current = next;
      setRemainingSeconds(next);

      if (previous !== null && previous > 0 && next === 0) {
        AccessibilityInfo.announceForAccessibility('El código ha caducado. Solicita uno nuevo.');
        clearInterval(interval);
      }
    }, 1_000);

    return () => clearInterval(interval);
  }, [verificationExpiresAt]);

  const errorCode = verifyOtp.isError ? verifyOtp.error.code : undefined;
  const challengeRejected = errorCode !== undefined && INVALID_CHALLENGE_CODES.has(errorCode);
  const hasNoToken = !verificationToken;
  const hasExpired = remainingSeconds === 0;
  const cannotVerify = hasNoToken || hasExpired || challengeRejected;
  const canResend = hasNoToken || remainingSeconds === null || hasExpired || challengeRejected;

  let errorMessage: string | undefined;
  if (hasNoToken) {
    errorMessage = 'No hay un código activo. Solicita uno nuevo para continuar.';
  } else if (errorCode) {
    errorMessage = ERROR_COPY_OVERRIDES[errorCode] ?? verifyOtp.error?.message;
  }

  let resendErrorMessage: string | undefined;
  if (resendVerification.isError) {
    if (resendVerification.error.statusCode === 429) {
      resendErrorMessage = 'Has solicitado demasiados códigos. Inténtalo más tarde.';
    } else if (resendVerification.error.code === 'NETWORK_ERROR') {
      resendErrorMessage =
        'No pudimos reenviar el código. Revisa tu conexión e inténtalo de nuevo.';
    } else if (resendVerification.error.code === 'AUTH_VERIFICATION_UNAVAILABLE') {
      resendErrorMessage =
        'No pudimos crear un código nuevo para esta cuenta. Cierra sesión y vuelve a entrar.';
    } else {
      resendErrorMessage = 'No pudimos reenviar el código. Inténtalo de nuevo.';
    }
  }

  const countdownMessage = hasNoToken
    ? 'Solicita un código nuevo para continuar.'
    : challengeRejected
      ? 'Este código ya no puede usarse. Solicita uno nuevo.'
      : remainingSeconds === null
        ? 'Puedes usar el código recibido o solicitar uno nuevo.'
        : hasExpired
          ? 'El código ha caducado. Solicita uno nuevo.'
          : `El código caduca en ${formatCountdown(remainingSeconds)}`;

  const handleCodeChange = (value: string): void => {
    if (verifyOtp.isError) verifyOtp.reset();
    if (resendVerification.isError || resendVerification.isSuccess) resendVerification.reset();
    setCode(value);
  };

  const handleSubmit = (): void => {
    if (!verificationToken || cannotVerify) return;
    verifyOtp.mutate(
      { verificationToken, code },
      {
        onSuccess: () => navigation.navigate('Onboarding'),
        onError: (error) => {
          if (error.code !== 'AUTH_INVALID_CREDENTIALS') return;
          setCode('');
          setFocusRequestKey((current) => (current ?? 0) + 1);
        },
      },
    );
  };

  const handleResend = (): void => {
    if (!user?.email || !canResend) return;
    resendVerification.mutate(user.email, {
      onSuccess: () => {
        setCode('');
        verifyOtp.reset();
        setFocusRequestKey((current) => (current ?? 0) + 1);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifica tu email</Text>
      <Text style={styles.subtitle}>Enviamos un código de 6 dígitos a {user?.email}</Text>

      <OtpInput
        value={code}
        onChange={handleCodeChange}
        length={CODE_LENGTH}
        disabled={cannotVerify}
        error={errorMessage}
        focusRequestKey={focusRequestKey}
        testID="verify-email-otp"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Text style={hasExpired ? styles.expired : styles.note}>{countdownMessage}</Text>
      {resendErrorMessage ? <Text style={styles.error}>{resendErrorMessage}</Text> : null}
      {resendVerification.isSuccess ? (
        <Text style={styles.success}>Enviamos un código nuevo a tu email.</Text>
      ) : null}

      <Button
        label="Verificar"
        onPress={handleSubmit}
        variant="primaryTonal"
        size="lg"
        style={styles.stretch}
        disabled={code.length !== CODE_LENGTH || cannotVerify}
        loading={verifyOtp.isPending}
        accessibilityHint="Verifica el código e ingresa a la app"
        testID="verify-email-submit"
      />
      <Button
        label={
          canResend || remainingSeconds === null
            ? 'Reenviar código'
            : `Reenviar código en ${formatCountdown(remainingSeconds)}`
        }
        onPress={handleResend}
        variant="linkNeutral"
        disabled={!canResend}
        loading={resendVerification.isPending}
        accessibilityHint="Solicita un código de verificación nuevo"
        testID="verify-email-resend"
      />
      <Button
        label="Cerrar sesión"
        onPress={() => logout.mutate()}
        variant="linkNeutral"
        loading={logout.isPending}
        accessibilityHint="Cierra la sesión y vuelve al inicio"
        testID="verify-email-signout"
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
  note: {
    ...typography.caption,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
  expired: {
    ...typography.caption,
    color: theme.warning,
    textAlign: 'center' as const,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
    textAlign: 'center' as const,
  },
  success: {
    ...typography.bodySmall,
    color: theme.success,
    textAlign: 'center' as const,
  },
  stretch: { alignSelf: 'stretch' as const },
});
