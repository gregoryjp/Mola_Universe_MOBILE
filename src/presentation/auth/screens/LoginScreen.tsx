import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoginForm } from '../components/LoginForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.title}>MOLA</Text>
    <Text style={styles.subtitle}>Inicia sesión</Text>
    <LoginForm />
    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
      <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
      <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});
