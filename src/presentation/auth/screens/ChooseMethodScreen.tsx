import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Text, View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseMethod'>;

/**
 * OAuth (Apple/Google) is explicitly out of scope until the sign-in contract
 * audit lands — `oauthSlot` reserves the visual space above "Continuar con
 * email" so those buttons can be added later without a redesign, but nothing
 * renders there today.
 *
 * The legal line is plain, non-tappable text: no terms/privacy screen or URL
 * exists yet anywhere in this app, so faking a destination would be worse
 * than not linking it.
 */
export const ChooseMethodScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>Crea tu cuenta</Text>
      </View>

      <View style={styles.methods}>
        <View style={styles.oauthSlot} testID="choose-method-oauth-slot" />
        <Button
          label="Continuar con email"
          onPress={() => navigation.navigate('Register')}
          variant="primaryTonal"
          size="lg"
          testID="choose-method-email"
        />
        <Text style={styles.legal}>
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </Text>
      </View>

      <Button
        label="¿Ya tienes cuenta? Inicia sesión"
        onPress={() => navigation.navigate('Login')}
        variant="linkNeutral"
        size="sm"
        testID="choose-method-login"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.background,
    paddingHorizontal: spacing.s6,
    paddingTop: spacing.s16,
    paddingBottom: spacing.s6,
  },
  header: {
    alignItems: 'center' as const,
  },
  headline: {
    ...typography.h1,
    color: theme.text,
    textAlign: 'center' as const,
  },
  methods: {
    gap: spacing.s3,
  },
  // Empty on purpose: reserved for the Apple/Google buttons a future task
  // adds, so "Continuar con email" doesn't have to move when they arrive.
  oauthSlot: {
    gap: spacing.s3,
  },
  legal: {
    ...typography.caption,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
});
