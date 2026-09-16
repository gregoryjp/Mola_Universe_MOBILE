import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useCreateHousehold } from '../hooks/useCreateHousehold';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateHousehold'>;

export const CreateHouseholdScreen = ({ navigation }: Props): JSX.Element => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const create = useCreateHousehold();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    create.mutate(description.length > 0 ? { name, description } : { name }, {
      onSuccess: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Crear hogar</Text>

      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Nombre de la casa"
        required
        testID="household-name"
      />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción (opcional)"
        testID="household-description"
      />

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <Button
        label="Crear hogar"
        onPress={handleSubmit}
        loading={create.isPending}
        disabled={name.length === 0}
        size="lg"
        accessibilityHint="Crea el hogar y vuelve al panel"
        testID="household-submit"
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
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
