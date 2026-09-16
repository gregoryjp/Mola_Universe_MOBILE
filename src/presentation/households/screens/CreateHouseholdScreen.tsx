import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateHousehold } from '../hooks/useCreateHousehold';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateHousehold'>;

export const CreateHouseholdScreen = ({ navigation }: Props): JSX.Element => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const create = useCreateHousehold();

  const handleSubmit = (): void => {
    create.mutate(description.length > 0 ? { name, description } : { name }, {
      onSuccess: () => navigation.navigate('Dashboard'),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Crear hogar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la casa"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción (opcional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <TouchableOpacity
        style={[styles.button, name.length === 0 ? styles.buttonDisabled : null]}
        onPress={handleSubmit}
        disabled={create.isPending || name.length === 0}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{create.isPending ? 'Creando…' : 'Crear hogar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
