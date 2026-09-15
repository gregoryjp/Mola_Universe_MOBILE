import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useHouseholds } from '../hooks/useHouseholds';

describe('useHouseholds', () => {
  it('should be defined', () => {
    expect(useHouseholds).toBeDefined();
  });
});
