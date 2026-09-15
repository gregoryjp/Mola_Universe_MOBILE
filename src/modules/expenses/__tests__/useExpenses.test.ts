import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useExpenses } from '../hooks/useExpenses';

describe('useExpenses', () => {
  it('should be defined', () => {
    expect(useExpenses).toBeDefined();
  });
});
