import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Screen } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Text } from 'react-native';
import { RegisterForm } from '../components/RegisterForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

/**
 * `Screen` owns the safe area, the scroll and the keyboard. The form is four
 * fields tall, so on a short phone its submit button used to sit under the
 * keyboard with nothing to scroll (TD-043).
 */
export const RegisterScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Screen align="center" keyboardAware dismissKeyboardOnTap gap={spacing.s4}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Verificaremos tu email con un código</Text>
      <RegisterForm />
      <Button
        label="¿Ya tienes cuenta? Inicia sesión"
        onPress={() => navigation.navigate('Login')}
        variant="linkNeutral"
        testID="register-login"
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
});
