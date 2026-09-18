import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { BrandLogo } from '@presentation/components/brand/BrandLogo';
import { Button, Screen } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { LoginForm } from '../components/LoginForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/**
 * Auth composition: a real headline carries the hierarchy instead of the logo
 * alone, the form (with its own primary CTA) sits in the middle, and the two
 * secondary navigation actions are visually subordinate — smaller and grouped
 * at the bottom as AA-compliant links — relative to `LoginForm`'s primary
 * "Entrar" button.
 *
 * Layout comes from `Screen` with `align="spread"`: the header pins to the top,
 * the secondary links to the bottom, and the form takes the middle. The
 * primitive also owns the safe area, the scroll and the keyboard, which this
 * screen previously did without (TD-043).
 */
export const LoginScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Screen
      align="spread"
      keyboardAware
      dismissKeyboardOnTap
      contentContainerStyle={styles.screenPadding}
    >
      <View style={styles.header}>
        <BrandLogo width={140} />
        <Text style={styles.headline}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>
      </View>

      <LoginForm />

      <View style={styles.secondaryActions}>
        <Button
          label="¿Olvidaste tu contraseña?"
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="linkNeutral"
          size="sm"
          testID="login-forgot"
        />
        <Button
          label="¿No tienes cuenta? Regístrate"
          onPress={() => navigation.navigate('Register')}
          variant="linkNeutral"
          size="sm"
          testID="login-register"
        />
      </View>
    </Screen>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  // The header sits high on the screen by design; `Screen` supplies the
  // horizontal gutter and the bottom inset.
  screenPadding: {
    paddingTop: spacing.s16,
  },
  header: {
    alignItems: 'center' as const,
    gap: spacing.s3,
  },
  headline: {
    ...typography.h1,
    color: theme.text,
    textAlign: 'center' as const,
  },
  subtitle: {
    ...typography.body,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
  secondaryActions: {
    alignItems: 'center' as const,
    gap: spacing.s1,
  },
});
