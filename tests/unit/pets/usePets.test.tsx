import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  listPets: vi.fn(),
  getPet: vi.fn(),
  listMedicalRecords: vi.fn(),
  listPermissions: vi.fn(),
}));

vi.mock('@data/pets/repositories/PetRepositoryImpl', () => ({
  petRepository: {
    listPets: mocks.listPets,
    getPet: mocks.getPet,
    listMedicalRecords: mocks.listMedicalRecords,
    listPermissions: mocks.listPermissions,
  },
}));

import type { Pet } from '@domain/pets/entities/Pet';
import {
  usePet,
  usePetMedicalRecords,
  usePetPermissions,
  usePets,
} from '@presentation/pets/hooks/usePets';
import { useHouseholdStore } from '@shared/store/householdStore';

const pet: Pet = {
  id: 'p1',
  householdId: 'h1',
  name: 'Luna',
  species: 'Perro',
  breed: null,
  birthDate: null,
  ageYears: 6,
  photoUrl: null,
  weightKg: null,
  allergies: null,
  notes: null,
  microchipNumber: null,
  vetName: null,
  vetPhone: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const render = async <T,>(
  useHook: () => T,
): Promise<{ captured: () => T; renderer: ReactTestRenderer }> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let value: T | undefined;
  const Harness = (): null => {
    value = useHook();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  const capturedRenderer = renderer;
  return {
    captured: () => {
      if (value === undefined) throw new Error('hook not captured');
      return value;
    },
    renderer: capturedRenderer,
  };
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await flushQueries();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: 'h1' });
});

describe('usePets', () => {
  it('loads the pets of the active household', async () => {
    mocks.listPets.mockResolvedValueOnce({ success: true, value: [pet] });

    const { captured, renderer } = await render(usePets);
    await flush();

    expect(mocks.listPets).toHaveBeenCalledWith('h1');
    expect(captured().data).toHaveLength(1);

    renderer.unmount();
  });

  it('does not query while no household is selected', async () => {
    useHouseholdStore.setState({ activeHouseholdId: null });

    const { captured, renderer } = await render(usePets);
    await flush();

    expect(mocks.listPets).not.toHaveBeenCalled();
    expect(captured().fetchStatus).toBe('idle');

    renderer.unmount();
  });

  it('exposes the backend error when the pet is missing', async () => {
    mocks.getPet.mockResolvedValueOnce({
      success: false,
      error: { code: 'PET_NOT_FOUND', message: 'Pet not found', statusCode: 404 },
    });

    const { captured, renderer } = await render(() => usePet('p9'));
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('PET_NOT_FOUND');

    renderer.unmount();
  });

  it('loads the medical records of a pet', async () => {
    mocks.listMedicalRecords.mockResolvedValueOnce({
      success: true,
      value: [
        {
          id: 'm1',
          petId: 'p1',
          type: 'VACCINE',
          title: 'Rabia',
          notes: null,
          date: '2026-08-01T00:00:00.000Z',
          nextDueDate: null,
          createdBy: 'u1',
          createdAt: '2026-08-01T10:00:00.000Z',
        },
      ],
    });

    const { captured, renderer } = await render(() => usePetMedicalRecords('p1'));
    await flush();

    expect(mocks.listMedicalRecords).toHaveBeenCalledWith('h1', 'p1');
    expect(captured().data).toHaveLength(1);

    renderer.unmount();
  });

  it('loads the explicit pet permissions', async () => {
    mocks.listPermissions.mockResolvedValueOnce({
      success: true,
      value: [{ householdId: 'h1', userId: 'u2', level: 'BASIC' }],
    });

    const { captured, renderer } = await render(usePetPermissions);
    await flush();

    expect(mocks.listPermissions).toHaveBeenCalledWith('h1');
    expect(captured().data?.[0]?.level).toBe('BASIC');

    renderer.unmount();
  });
});
