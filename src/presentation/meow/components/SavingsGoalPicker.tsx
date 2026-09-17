import {
  useHouseholdSavingsGoals,
  usePersonalSavingsGoals,
} from '@presentation/savings/hooks/useSavingsGoals';
import type { JSX } from 'react';
import { type Option, OptionPicker } from './OptionPicker';

interface Props {
  selectedId: string | null;
  onSelect: (goalId: string) => void;
}

/** Loads the savings goals the user can contribute to. */
export const SavingsGoalPicker = ({ selectedId, onSelect }: Props): JSX.Element => {
  const { goals: householdGoals, isLoading: isHouseholdLoading } = useHouseholdSavingsGoals();
  const { goals: personalGoals, isLoading: isPersonalLoading } = usePersonalSavingsGoals();
  const isLoading = isHouseholdLoading || isPersonalLoading;

  const options: Option[] = [...householdGoals, ...personalGoals].map((goal) => ({
    id: goal.id,
    label: goal.name,
  }));

  return (
    <OptionPicker
      options={options}
      selectedId={selectedId}
      onSelect={onSelect}
      emptyLabel={isLoading ? 'Cargando metas…' : 'No tienes metas de ahorro'}
      accessibilityLabel="Elegir meta de ahorro"
    />
  );
};
