import { colors, spacing, typography } from '@core/theme';
import type { SavingsCell } from '@domain/savings/entities/SavingsGoal';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
export const SavingsBoard = ({ cells, pendingCellId, onToggle }: Props): JSX.Element => (
  <View style={styles.grid}>
    {cells.map((cell) => (
      <TouchableOpacity
        key={cell.id}
        style={[styles.cell, cell.isMarked ? styles.cellMarked : null]}
        onPress={() => onToggle(cell)}
        disabled={pendingCellId !== null}
        accessibilityRole="button"
        accessibilityState={{ selected: cell.isMarked }}
      >
        <Text style={[styles.cellText, cell.isMarked ? styles.cellTextMarked : null]}>
          {cell.denomination}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  cell: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cellMarked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  cellTextMarked: {
    color: colors.background,
  },
});
