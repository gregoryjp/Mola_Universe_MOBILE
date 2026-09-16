import type { RootStackParamList } from '@core/navigation/types';
import { Button } from '@presentation/components/ui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { JSX } from 'react';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Chip that opens the "create household" form from the household selector. */
export const CreateHouseholdButton = (): JSX.Element => {
  const navigation = useNavigation<Nav>();

  return (
    <Button
      label="+ Crear hogar"
      onPress={() => navigation.navigate('CreateHousehold')}
      variant="secondary"
      size="sm"
      accessibilityHint="Abre el formulario para crear un hogar"
    />
  );
};
