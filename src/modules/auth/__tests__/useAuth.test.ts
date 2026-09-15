import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import { useSessionStore } from '../../../shared/auth/secure-session-store';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset session store
    useSessionStore.setState({
      accessToken: null,
      refreshToken: null,
      userId: null,
    });
  });

  it('should export useAuth hook', () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });

  it('should return login mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBeDefined();
    expect(result.current.login.mutate).toBeDefined();
  });

  it('should return register mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.register).toBeDefined();
    expect(result.current.register.mutate).toBeDefined();
  });

  it('should return logout mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.logout).toBeDefined();
    expect(result.current.logout.mutate).toBeDefined();
  });

  it('should return forgotPassword mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.forgotPassword).toBeDefined();
  });

  it('should return resetPassword mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.resetPassword).toBeDefined();
  });

  it('should return verifyOTP mutation', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.verifyOTP).toBeDefined();
  });

  it('should return currentUser query', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toBeDefined();
  });

  it('should track isAuthenticated state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should have isLoading state available', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login.isPending).toBeDefined();
    expect(result.current.register.isPending).toBeDefined();
    expect(result.current.logout.isPending).toBeDefined();
  });
});
