import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { useLogout } from '@presentation/auth/hooks/useLogout';
import { Button, Card, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

/**
 * Minimal account screen that closes the P0-2 gap: before this there was no UI
 * anywhere that could sign a user out (the only `signOut` call lived inside the
 * 401 refresh interceptor). It shows who is signed in and offers logout.
 */
export const AccountScreen = ({ navigation }: Props): JSX.Element => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Cuenta" onBack={() => navigation.goBack()} testID="account-header" />

      <Card size="sm">
        <Text style={styles.name}>{user?.name ?? 'Sesión activa'}</Text>
        {user ? <Text style={styles.email}>{user.email}</Text> : null}
        {user && !user.emailVerified ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Tu email todavía no está verificado.</Text>
            <Button
              label="Verificar email"
              onPress={() => navigation.navigate('VerifyEmail')}
              variant="link"
              size="sm"
              testID="account-verify-email"
            />
          </View>
        ) : null}
      </Card>

      <Button
        label="Cerrar sesión"
        variant="danger"
        size="lg"
        loading={logout.isPending}
        onPress={() => logout.mutate()}
        accessibilityHint="Cierra la sesión en este dispositivo"
        testID="logout-button"
      />
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s4,
  },
  name: {
    ...typography.bodyLarge,
    color: theme.text,
  },
  email: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  warningBox: {
    backgroundColor: theme.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.s3,
  },
  warningText: {
    ...typography.caption,
    color: theme.text,
  },
});
