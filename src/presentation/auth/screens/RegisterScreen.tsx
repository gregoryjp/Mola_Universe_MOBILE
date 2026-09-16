import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegisterForm } from '../components/RegisterForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.title}>Crear cuenta</Text>
    <Text style={styles.subtitle}>Verificaremos tu email con un código</Text>
    <RegisterForm />
    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
      <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});
