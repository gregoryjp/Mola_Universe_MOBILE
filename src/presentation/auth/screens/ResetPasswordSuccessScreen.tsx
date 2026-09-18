import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, useThemedStyles } from '@core/theme';
import { EmptyState } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPasswordSuccess'>;

export const ResetPasswordSuccessScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  const handleLogin = (): void => {
    // Reset (not navigate/goBack) so the OTP and password screens are gone
    // from the stack — there is nothing to go back to from Login.
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <EmptyState
        title="¡Todo listo!"
        description="Tu contraseña se actualizó correctamente."
        actionLabel="Iniciar sesión"
        onAction={handleLogin}
        testID="reset-success"
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
  },
});
