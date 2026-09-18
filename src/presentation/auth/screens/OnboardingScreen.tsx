import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Chip, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type HouseholdChoice = 'create' | 'later';

export const OnboardingScreen = ({ navigation }: Props): JSX.Element => {
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(user?.name ?? '');
  const [householdChoice, setHouseholdChoice] = useState<HouseholdChoice>('later');
  const updateProfile = useUpdateProfile();
  const styles = useThemedStyles(makeStyles);

  const goToNextStep = (): void => {
    if (householdChoice === 'create') {
      navigation.navigate('CreateHousehold');
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Dashboard' });
  };

  const handleContinue = (): void => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName === user?.name) {
      goToNextStep();
      return;
    }
    updateProfile.mutate({ displayName: trimmedName }, { onSuccess: goToNextStep });
  };

  const handleSkip = (): void => {
    navigation.navigate('MainTabs', { screen: 'Dashboard' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cuéntanos un poco de ti</Text>

      <Input
        label="¿Cómo te llamamos?"
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        testID="onboarding-name"
      />

      <Text style={styles.sectionLabel}>¿Ya tienes un hogar?</Text>
      <View style={styles.choices}>
        <Chip
          label="Sí, crear uno"
          selected={householdChoice === 'create'}
          onPress={() => setHouseholdChoice('create')}
          testID="onboarding-household-create"
        />
        <Chip
          label="Me uniré después"
          selected={householdChoice === 'later'}
          onPress={() => setHouseholdChoice('later')}
          testID="onboarding-household-later"
        />
      </View>

      {updateProfile.isError ? (
        <Text style={styles.error}>{updateProfile.error.message}</Text>
      ) : null}

      <Button
        label="Continuar"
        onPress={handleContinue}
        loading={updateProfile.isPending}
        variant="primaryTonal"
        size="lg"
        accessibilityHint="Guarda tu nombre y continúa"
        testID="onboarding-continue"
      />
      <Button
        label="Omitir por ahora"
        onPress={handleSkip}
        variant="linkNeutral"
        testID="onboarding-skip"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  sectionLabel: {
    ...typography.body,
    color: theme.text,
  },
  choices: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
