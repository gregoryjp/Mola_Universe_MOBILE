import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useUsers } from '../hooks/useUsers';

describe('useUsers', () => {
  it('should be defined', () => {
    expect(useUsers).toBeDefined();
  });
});
