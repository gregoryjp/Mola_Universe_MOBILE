import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { OtpInput } from '@presentation/components/ui/OtpInput';

const byTestId = (renderer: ReactTestRenderer, testID: string) => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  if (!node) throw new Error(`No element with testID "${testID}"`);
  return node;
};

// react-test-renderer gives every host-element ref `null` unless a mock
// instance is supplied via `createNodeMock`. Each box's `ref={(ref) => ...}`
// then receives this mock, keyed by the same `testID` the component renders
// it with, so a box's `.focus()` call can be asserted per index.
const focusMocks = new Map<string, ReturnType<typeof vi.fn>>();

const createNodeMock = (element: { props: unknown }): { focus: () => void } => {
  const testID = (element.props as { testID?: string }).testID;
  const focus = vi.fn();
  if (testID) focusMocks.set(testID, focus);
  return { focus };
};

const render = (props: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  focusRequestKey?: number;
}): ReactTestRenderer => {
  focusMocks.clear();
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<OtpInput {...props} testID="otp" />, { createNodeMock });
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OtpInput', () => {
  it('renders one box per digit, each with a distinct per-digit accessibility label', () => {
    const renderer = render({ value: '', onChange: vi.fn() });

    for (let index = 0; index < 6; index += 1) {
      const box = byTestId(renderer, `otp-${index}`);
      expect(box.props.accessibilityLabel).toBe(
        `Código de verificación - dígito ${index + 1} de 6`,
      );
      expect(box.props.keyboardType).toBe('number-pad');
    }

    renderer.unmount();
  });

  it('typing one digit commits it and advances focus to the next box', () => {
    const onChange = vi.fn();
    const renderer = render({ value: '1', onChange });

    act(() => {
      byTestId(renderer, 'otp-1').props.onChangeText('2');
    });

    expect(onChange).toHaveBeenCalledWith('12');

    renderer.unmount();
  });

  it('calls onComplete only once the code reaches full length', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const renderer = render({ value: '12345', onChange, onComplete });

    act(() => {
      byTestId(renderer, 'otp-5').props.onChangeText('6');
    });

    expect(onChange).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');

    renderer.unmount();
  });

  it('pasting a full 6-digit code into the first box fills every box at once', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const renderer = render({ value: '', onChange, onComplete });

    act(() => {
      byTestId(renderer, 'otp-0').props.onChangeText('654321');
    });

    expect(onChange).toHaveBeenCalledWith('654321');
    expect(onComplete).toHaveBeenCalledWith('654321');

    renderer.unmount();
  });

  it('strips non-numeric characters from a paste before filling the boxes', () => {
    const onChange = vi.fn();
    const renderer = render({ value: '', onChange });

    act(() => {
      byTestId(renderer, 'otp-0').props.onChangeText('12-34-56');
    });

    expect(onChange).toHaveBeenCalledWith('123456');

    renderer.unmount();
  });

  it('backspacing an empty box moves focus back and clears the previous digit', () => {
    const onChange = vi.fn();
    const renderer = render({ value: '12', onChange });

    act(() => {
      byTestId(renderer, 'otp-2').props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
    });

    expect(focusMocks.get('otp-1')).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('1');

    renderer.unmount();
  });

  it('backspacing a box that still holds a digit only clears that box, without moving focus', () => {
    const onChange = vi.fn();
    const renderer = render({ value: '123', onChange });

    act(() => {
      byTestId(renderer, 'otp-1').props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
    });

    expect(focusMocks.get('otp-0')).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('disables every box when disabled is set', () => {
    const renderer = render({ value: '', onChange: vi.fn(), disabled: true });

    for (let index = 0; index < 6; index += 1) {
      const box = byTestId(renderer, `otp-${index}`);
      expect(box.props.editable).toBe(false);
      expect(box.props.accessibilityState).toEqual({ disabled: true });
    }

    renderer.unmount();
  });

  it('focuses the first box when focusRequestKey changes', () => {
    const renderer = render({ value: '', onChange: vi.fn() });

    act(() => {
      renderer.update(<OtpInput value="" onChange={vi.fn()} testID="otp" focusRequestKey={1} />);
    });

    expect(focusMocks.get('otp-0')).toHaveBeenCalled();

    renderer.unmount();
  });
});
