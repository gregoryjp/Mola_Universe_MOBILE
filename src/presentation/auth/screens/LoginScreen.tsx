import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { LoginForm } from '../components/LoginForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MOLA</Text>
      <Text style={styles.subtitle}>Inicia sesión</Text>
      <LoginForm />
      <Button
        label="¿No tienes cuenta? Regístrate"
        onPress={() => navigation.navigate('Register')}
        variant="link"
      />
      <Button
        label="¿Olvidaste tu contraseña?"
        onPress={() => navigation.navigate('ForgotPassword')}
        variant="link"
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
    ...typography.display,
    color: theme.primary,
  },
  subtitle: {
    ...typography.body,
    color: theme.textMuted,
  },
});
