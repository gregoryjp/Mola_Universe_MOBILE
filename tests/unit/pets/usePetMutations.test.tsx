import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  createPet: vi.fn(),
  updatePet: vi.fn(),
  archivePet: vi.fn(),
  createMedicalRecord: vi.fn(),
  deleteMedicalRecord: vi.fn(),
  setPermission: vi.fn(),
  createCareTask: vi.fn(),
}));

vi.mock('@data/pets/repositories/PetRepositoryImpl', () => ({
  petRepository: {
    createPet: mocks.createPet,
    updatePet: mocks.updatePet,
    archivePet: mocks.archivePet,
    createMedicalRecord: mocks.createMedicalRecord,
    deleteMedicalRecord: mocks.deleteMedicalRecord,
    setPermission: mocks.setPermission,
    createCareTask: mocks.createCareTask,
  },
}));

import type { Pet } from '@domain/pets/entities/Pet';
import {
  useArchivePet,
  useCreateMedicalRecord,
  useCreatePet,
  useCreatePetCareTask,
  useDeleteMedicalRecord,
  useSetPetPermission,
  useUpdatePet,
} from '@presentation/pets/hooks/usePetMutations';
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
): Promise<{ captured: () => T; renderer: ReactTestRenderer; client: QueryClient }> => {
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
    client,
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

describe('pet mutation hooks', () => {
  it('creates a pet in the active household', async () => {
    mocks.createPet.mockResolvedValueOnce({ success: true, value: pet });

    const { captured, renderer } = await render(useCreatePet);

    await act(async () => {
      captured().mutate({ name: 'Luna', species: 'Perro' });
    });
    await flush();

    expect(mocks.createPet).toHaveBeenCalledWith('h1', { name: 'Luna', species: 'Perro' });
    expect(captured().data?.id).toBe('p1');

    renderer.unmount();
  });

  it('fails fast without a household instead of calling the backend', async () => {
    useHouseholdStore.setState({ activeHouseholdId: null });

    const { captured, renderer } = await render(useCreatePet);

    await act(async () => {
      captured().mutate({ name: 'Luna', species: 'Perro' });
    });
    await flush();

    expect(mocks.createPet).not.toHaveBeenCalled();
    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('NO_HOUSEHOLD');

    renderer.unmount();
  });

  it('updates a pet', async () => {
    mocks.updatePet.mockResolvedValueOnce({ success: true, value: { ...pet, name: 'Luna II' } });

    const { captured, renderer } = await render(() => useUpdatePet('p1'));

    await act(async () => {
      captured().mutate({ name: 'Luna II' });
    });
    await flush();

    expect(mocks.updatePet).toHaveBeenCalledWith('h1', 'p1', { name: 'Luna II' });
    expect(captured().data?.name).toBe('Luna II');

    renderer.unmount();
  });

  it('archives a pet', async () => {
    mocks.archivePet.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useArchivePet);

    await act(async () => {
      captured().mutate('p1');
    });
    await flush();

    expect(mocks.archivePet).toHaveBeenCalledWith('h1', 'p1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('surfaces the insufficient-permission error', async () => {
    mocks.createPet.mockResolvedValueOnce({
      success: false,
      error: {
        code: 'INSUFFICIENT_PET_PERMISSION',
        message: 'Insufficient Pets permission level for this action',
        statusCode: 403,
      },
    });

    const { captured, renderer } = await render(useCreatePet);

    await act(async () => {
      captured().mutate({ name: 'Luna', species: 'Perro' });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('INSUFFICIENT_PET_PERMISSION');

    renderer.unmount();
  });

  it('creates a medical record for the pet', async () => {
    mocks.createMedicalRecord.mockResolvedValueOnce({
      success: true,
      value: {
        id: 'm1',
        petId: 'p1',
        type: 'VACCINE',
        title: 'Rabia',
        notes: null,
        date: '2026-08-01',
        nextDueDate: null,
        createdBy: 'u1',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
    });

    const { captured, renderer } = await render(() => useCreateMedicalRecord('p1'));

    await act(async () => {
      captured().mutate({ type: 'VACCINE', title: 'Rabia', date: '2026-08-01' });
    });
    await flush();

    expect(mocks.createMedicalRecord).toHaveBeenCalledWith('h1', 'p1', {
      type: 'VACCINE',
      title: 'Rabia',
      date: '2026-08-01',
    });
    expect(captured().data?.id).toBe('m1');

    renderer.unmount();
  });

  it('deletes a medical record', async () => {
    mocks.deleteMedicalRecord.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(() => useDeleteMedicalRecord('p1'));

    await act(async () => {
      captured().mutate('m1');
    });
    await flush();

    expect(mocks.deleteMedicalRecord).toHaveBeenCalledWith('h1', 'p1', 'm1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('sets a member permission level', async () => {
    mocks.setPermission.mockResolvedValueOnce({
      success: true,
      value: { householdId: 'h1', userId: 'u2', level: 'MEDICAL' },
    });

    const { captured, renderer } = await render(useSetPetPermission);

    await act(async () => {
      captured().mutate({ userId: 'u2', level: 'MEDICAL' });
    });
    await flush();

    expect(mocks.setPermission).toHaveBeenCalledWith('h1', 'u2', 'MEDICAL');
    expect(captured().data?.level).toBe('MEDICAL');

    renderer.unmount();
  });

  describe('useCreatePetCareTask (TD-021)', () => {
    it('creates the task through the pet route', async () => {
      mocks.createCareTask.mockResolvedValueOnce({ success: true, value: undefined });

      const { captured, renderer } = await render(() => useCreatePetCareTask('p1'));

      await act(async () => {
        captured().mutate({ title: 'Pasear', dueDate: '2026-09-20' });
      });
      await flush();

      expect(mocks.createCareTask).toHaveBeenCalledWith('h1', 'p1', {
        title: 'Pasear',
        dueDate: '2026-09-20',
      });
      expect(captured().isSuccess).toBe(true);

      renderer.unmount();
    });

    it('refreshes the tasks lists, which is how the new task becomes visible', async () => {
      // The created value is a household task and does not travel back through
      // the Pets port, so invalidation is the only path from "created" to
      // "visible in Tareas". Without it the task exists and the user cannot see it.
      mocks.createCareTask.mockResolvedValueOnce({ success: true, value: undefined });

      const { captured, renderer, client } = await render(() => useCreatePetCareTask('p1'));
      const invalidate = vi.spyOn(client, 'invalidateQueries');

      await act(async () => {
        captured().mutate({ title: 'Pasear', dueDate: '2026-09-20' });
      });
      await flush();

      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });

      renderer.unmount();
    });

    it('fails fast without a household instead of calling the backend', async () => {
      useHouseholdStore.setState({ activeHouseholdId: null });

      const { captured, renderer } = await render(() => useCreatePetCareTask('p1'));

      await act(async () => {
        captured().mutate({ title: 'Pasear', dueDate: '2026-09-20' });
      });
      await flush();

      expect(mocks.createCareTask).not.toHaveBeenCalled();
      expect(captured().error?.code).toBe('NO_HOUSEHOLD');

      renderer.unmount();
    });

    it('surfaces a pet permission failure', async () => {
      mocks.createCareTask.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'INSUFFICIENT_PET_PERMISSION',
          message: 'Insufficient Pets permission level for this action',
          statusCode: 403,
        },
      });

      const { captured, renderer } = await render(() => useCreatePetCareTask('p1'));

      await act(async () => {
        captured().mutate({ title: 'Pasear', dueDate: '2026-09-20' });
      });
      await flush();

      expect(captured().error?.code).toBe('INSUFFICIENT_PET_PERMISSION');

      renderer.unmount();
    });
  });
});
