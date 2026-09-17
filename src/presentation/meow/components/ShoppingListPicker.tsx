import { useShoppingLists } from '@presentation/shopping/hooks/useShoppingLists';
import type { JSX } from 'react';
import { type Option, OptionPicker } from './OptionPicker';

interface Props {
  selectedId: string | null;
  onSelect: (listId: string) => void;
}

/** Loads the shopping lists of the active household (or the personal ones). */
export const ShoppingListPicker = ({ selectedId, onSelect }: Props): JSX.Element => {
  const { lists, isLoading } = useShoppingLists();

  const options: Option[] = lists.map((list) => ({ id: list.id, label: list.name }));

  return (
    <OptionPicker
      options={options}
      selectedId={selectedId}
      onSelect={onSelect}
      emptyLabel={isLoading ? 'Cargando listas…' : 'No tienes listas de la compra'}
      accessibilityLabel="Elegir lista de la compra"
    />
  );
};
