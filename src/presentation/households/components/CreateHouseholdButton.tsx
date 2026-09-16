import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Chip that opens the "create household" form from the household selector. */
export const CreateHouseholdButton = (): JSX.Element => {
  const navigation = useNavigation<Nav>();

  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={() => navigation.navigate('CreateHousehold')}
      accessibilityRole="button"
    >
      <Text style={styles.chipText}>+ Crear hogar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.caption,
    color: colors.primary,
  },
});
