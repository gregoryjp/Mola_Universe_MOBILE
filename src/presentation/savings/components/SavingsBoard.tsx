import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { SavingsCell } from '@domain/savings/entities/SavingsGoal';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  cells: SavingsCell[];
  /** Id of the cell currently being marked/unmarked (disables double taps). */
  pendingCellId: string | null;
  onToggle: (cell: SavingsCell) => void;
}

/**
 * The savings board: each cell is a fixed denomination that the user "fills".
 * Marking a cell adds its face value to the goal; tapping a marked cell unmarks
 * it (the backend records a REVERSAL movement).
 */
export const SavingsBoard = ({ cells, pendingCellId, onToggle }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.grid}>
      {cells.map((cell) => (
        <TouchableOpacity
          key={cell.id}
          style={[styles.cell, cell.isMarked ? styles.cellMarked : null]}
          onPress={() => onToggle(cell)}
          disabled={pendingCellId !== null}
          accessibilityRole="button"
          accessibilityState={{ selected: cell.isMarked }}
          accessibilityLabel={`Celda de ${cell.denomination}`}
          accessibilityHint={cell.isMarked ? 'Desmarca esta celda' : 'Marca esta celda'}
        >
          <Text style={[styles.cellText, cell.isMarked ? styles.cellTextMarked : null]}>
            {cell.denomination}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s1,
  },
  cell: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.s2,
    paddingHorizontal: spacing.s2,
  },
  cellMarked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  cellText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  cellTextMarked: {
    color: theme.textInverse,
  },
});
