import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import { useState } from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

/** The text-like types from design/components/inputs.md. */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'textarea';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  /** Shown under the input; replaced by `error` when validation fails. */
  helperText?: string;
  error?: string;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Overrides the label as the screen-reader name for the field. */
  accessibilityLabel?: string;
}

/**
 * Inputs are documented by type and state but have no pixel sizes, so the three
 * sizes below compose from tokens; `md` matches the md button height (40) plus
 * hit area, and every size clears the 44px touch minimum from
 * accessibility/guidelines.md.
 */
const SIZES: Record<
  InputSize,
  { height: number; paddingHorizontal: number; text: 'bodySmall' | 'body' | 'bodyLarge' }
> = {
  sm: { height: 44, paddingHorizontal: spacing.s3, text: 'bodySmall' },
  md: { height: 48, paddingHorizontal: spacing.s4, text: 'body' },
  lg: { height: 56, paddingHorizontal: spacing.s6, text: 'bodyLarge' },
};

const KEYBOARD_BY_TYPE: Partial<Record<InputType, TextInputProps['keyboardType']>> = {
  email: 'email-address',
  number: 'numeric',
};

const makeStyles = (theme: ColorTokens) => ({
  wrapper: { gap: spacing.s1, width: '100%' as const },
  labelRow: { flexDirection: 'row' as const, gap: spacing.s1 },
  label: { color: theme.text },
  required: { color: theme.error },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    backgroundColor: theme.surface,
    color: theme.text,
  },
  inputError: { borderColor: theme.error },
  inputDisabled: { backgroundColor: theme.surfaceAlt, color: theme.textMuted },
  error: { color: theme.error },
  helper: { color: theme.textMuted },
});

export const Input = ({
  value,
  onChangeText,
  label,
  helperText,
  error,
  type = 'text',
  size = 'md',
  placeholder,
  disabled = false,
  readonly = false,
  required = false,
  multiline = false,
  maxLength,
  autoCapitalize,
  keyboardType,
  onBlur,
  style,
  testID,
  accessibilityLabel,
}: InputProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const dimensions = SIZES[size];
  const isMultiline = multiline || type === 'textarea';
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[typography.bodySmall, styles.label]}>{label}</Text>
          {required ? <Text style={[typography.bodySmall, styles.required]}>*</Text> : null}
        </View>
      ) : null}
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        editable={!disabled && !readonly}
        secureTextEntry={type === 'password'}
        keyboardType={KEYBOARD_BY_TYPE[type] ?? keyboardType}
        autoCapitalize={type === 'email' ? 'none' : autoCapitalize}
        multiline={isMultiline}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? helperText}
        accessibilityState={{ disabled }}
        style={[
          typography[dimensions.text],
          styles.input,
          {
            height: isMultiline ? undefined : dimensions.height,
            minHeight: isMultiline ? dimensions.height * 2 : dimensions.height,
            paddingHorizontal: dimensions.paddingHorizontal,
            paddingVertical: isMultiline ? spacing.s2 : undefined,
            textAlignVertical: isMultiline ? 'top' : undefined,
          },
          focused && !hasError ? { borderColor: theme.primary } : null,
          hasError ? styles.inputError : null,
          disabled || readonly ? styles.inputDisabled : null,
        ]}
      />
      {hasError ? (
        <Text style={[typography.caption, styles.error]}>{error}</Text>
      ) : helperText ? (
        <Text style={[typography.caption, styles.helper]}>{helperText}</Text>
      ) : null}
    </View>
  );
};
