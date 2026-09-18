import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import { useEffect, useRef } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';

interface OtpInputProps {
  /** Number of digit boxes. Password reset uses the backend's 6-digit code. */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Fired once the value reaches `length` digits, from a keystroke or a paste. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  testID?: string;
  /** Prefix for each box's screen-reader label, e.g. "Código de verificación". */
  accessibilityLabel?: string;
  /** Changing this value moves focus back to the first digit. */
  focusRequestKey?: number;
}

const makeStyles = (theme: ColorTokens) => ({
  row: { flexDirection: 'row' as const, gap: spacing.s2, justifyContent: 'center' as const },
  box: {
    width: 44,
    height: 56,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    backgroundColor: theme.surface,
    color: theme.text,
    textAlign: 'center' as const,
  },
  boxError: { borderColor: theme.error },
});

/**
 * Six-box OTP entry: numeric keyboard, auto-advances on digit entry, backspace
 * moves focus back to the previous box, and pasting a full code into any box
 * fills every box from that position. Each box's `value` is always the single
 * digit `value[index]`, so the component stays fully controlled — a caller
 * clearing `value` clears every box.
 */
export const OtpInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error,
  testID,
  accessibilityLabel = 'Código de verificación',
  focusRequestKey,
}: OtpInputProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');
  const hasError = Boolean(error);

  useEffect(() => {
    if (focusRequestKey === undefined) return;
    inputRefs.current[0]?.focus();
  }, [focusRequestKey]);

  const commit = (next: string): void => {
    const truncated = next.slice(0, length);
    onChange(truncated);
    if (truncated.length === length) onComplete?.(truncated);
  };

  const handleChangeText = (index: number, text: string): void => {
    const digitsOnly = text.replace(/[^0-9]/g, '');

    if (digitsOnly.length > 1) {
      // A paste landed in one box: fill forward from this position.
      const merged = value.slice(0, index) + digitsOnly;
      commit(merged);
      inputRefs.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = digitsOnly;
    commit(nextDigits.join(''));

    if (digitsOnly && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    { nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ): void => {
    if (nativeEvent.key !== 'Backspace' || digits[index] || index === 0) return;
    inputRefs.current[index - 1]?.focus();
    const nextDigits = [...digits];
    nextDigits[index - 1] = '';
    onChange(nextDigits.join(''));
  };

  return (
    <View style={styles.row} testID={testID}>
      {digits.map((digit, index) => (
        <TextInput
          // Fixed-length grid of boxes; the boxes never reorder.
          // biome-ignore lint/suspicious/noArrayIndexKey: static-length box grid
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChangeText(index, text)}
          onKeyPress={(event) => handleKeyPress(index, event)}
          keyboardType="number-pad"
          maxLength={length}
          editable={!disabled}
          placeholderTextColor={theme.textMuted}
          selectTextOnFocus
          style={[typography.h4, styles.box, hasError ? styles.boxError : null]}
          testID={testID ? `${testID}-${index}` : undefined}
          accessibilityLabel={`${accessibilityLabel} - dígito ${index + 1} de ${length}`}
          accessibilityState={{ disabled }}
        />
      ))}
    </View>
  );
};
