import { useHouseholdTasks } from '@presentation/tasks/hooks/useHouseholdTasks';
import { useTasksList } from '@presentation/tasks/hooks/useTasksList';
import type { JSX } from 'react';
import { type Option, OptionPicker } from './OptionPicker';

interface Props {
  selectedId: string | null;
  onSelect: (taskId: string) => void;
}

/** Loads the tasks the user can act on: household first, then personal. */
export const TaskPicker = ({ selectedId, onSelect }: Props): JSX.Element => {
  const { tasks: householdTasks, isLoading: isHouseholdLoading } = useHouseholdTasks();
  const { tasks: personalTasks, isLoading: isPersonalLoading } = useTasksList();
  const isLoading = isHouseholdLoading || isPersonalLoading;

  const options: Option[] = [...householdTasks, ...personalTasks].map((task) => ({
    id: task.id,
    label: task.title,
  }));

  return (
    <OptionPicker
      options={options}
      selectedId={selectedId}
      onSelect={onSelect}
      emptyLabel={isLoading ? 'Cargando tareas…' : 'No tienes tareas para elegir'}
      accessibilityLabel="Elegir tarea"
    />
  );
};
