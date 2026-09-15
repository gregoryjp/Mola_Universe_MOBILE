import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useTasks } from '../hooks/useTasks';

describe('useTasks', () => {
  it('should export useTasks hook', () => {
    expect(useTasks).toBeDefined();
    expect(typeof useTasks).toBe('function');
  });

  it('should return tasks array', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(Array.isArray(result.current.tasks)).toBe(true);
  });

  it('should return isLoading state', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should return createTask mutation', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(result.current.createTask).toBeDefined();
    expect(result.current.createTask.mutate).toBeDefined();
  });

  it('should return updateTask mutation', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(result.current.updateTask).toBeDefined();
    expect(result.current.updateTask.mutate).toBeDefined();
  });

  it('should handle householdId parameter', () => {
    const { result: result1 } = renderHook(() => useTasks('household-1'));
    const { result: result2 } = renderHook(() => useTasks('household-2'));

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('should work without householdId', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toBeDefined();
  });
});
