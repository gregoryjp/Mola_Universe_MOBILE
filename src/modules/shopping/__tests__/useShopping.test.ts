import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useShopping } from '../hooks/useShopping';

describe('useShopping', () => {
  it('should return lists array', () => {
    const { result } = renderHook(() => useShopping('household-1'));
    expect(Array.isArray(result.current.lists)).toBe(true);
  });

  it('should return items array', () => {
    const { result } = renderHook(() => useShopping('household-1', 'list-1'));
    expect(Array.isArray(result.current.items)).toBe(true);
  });

  it('should return addItem mutation', () => {
    const { result } = renderHook(() => useShopping('household-1', 'list-1'));
    expect(result.current.addItem).toBeDefined();
  });
});
