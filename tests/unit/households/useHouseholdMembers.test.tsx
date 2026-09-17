import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({ listMembers: vi.fn() }));

vi.mock('@data/households/repositories/HouseholdRepositoryImpl', () => ({
  householdRepository: { listMembers: mocks.listMembers },
}));

import type { HouseholdMember } from '@domain/households/entities/Household';
import {
  memberNameById,
  useHouseholdMembers,
} from '@presentation/households/hooks/useHouseholdMembers';

const member = (userId: string, name: string): HouseholdMember => ({
  id: `m-${userId}`,
  userId,
  name,
  email: `${name.toLowerCase()}@ejemplo.com`,
  role: 'MEMBER',
  joinedAt: '2026-09-15T00:00:00.000Z',
});

const withQueryClient = async (node: React.ReactElement): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
  await act(async () => {
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useHouseholdMembers', () => {
  it('reads the members of the active household', async () => {
    mocks.listMembers.mockResolvedValue({
      success: true,
      value: [member('u1', 'Gregory'), member('u2', 'Ana')],
    });

    let captured: ReturnType<typeof useHouseholdMembers> | undefined;
    const Harness = (): null => {
      captured = useHouseholdMembers('hh-1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listMembers).toHaveBeenCalledWith('hh-1');
    expect(captured?.members.map((it) => it.name)).toEqual(['Gregory', 'Ana']);

    renderer.unmount();
  });

  it('does not call the backend without an active household', async () => {
    let captured: ReturnType<typeof useHouseholdMembers> | undefined;
    const Harness = (): null => {
      captured = useHouseholdMembers(null);
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listMembers).not.toHaveBeenCalled();
    expect(captured?.members).toEqual([]);

    renderer.unmount();
  });

  it('falls back to an empty list and an error instead of throwing at the screen', async () => {
    mocks.listMembers.mockResolvedValue({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authorized', statusCode: 403 },
    });

    let captured: ReturnType<typeof useHouseholdMembers> | undefined;
    const Harness = (): null => {
      captured = useHouseholdMembers('hh-1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');
    expect(captured?.members).toEqual([]);

    renderer.unmount();
  });
});

describe('memberNameById', () => {
  const members = [member('u1', 'Gregory'), member('u2', 'Ana')];

  it('resolves a member id to their name', () => {
    expect(memberNameById(members, 'u2')).toBe('Ana');
  });

  it('returns null for a null id, so the caller keeps its neutral copy', () => {
    expect(memberNameById(members, null)).toBeNull();
  });

  it('returns null for a member that is not in the list (archived, or still loading)', () => {
    expect(memberNameById(members, 'u-archived')).toBeNull();
    expect(memberNameById([], 'u1')).toBeNull();
  });
});
