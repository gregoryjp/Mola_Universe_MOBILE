import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  usePet: vi.fn(),
  usePetMedicalRecords: vi.fn(),
  usePetPermissions: vi.fn(),
  useCreatePetCareTask: vi.fn(),
  useCreateMedicalRecord: vi.fn(),
  useDeleteMedicalRecord: vi.fn(),
  useSetPetPermission: vi.fn(),
  useArchivePet: vi.fn(),
}));

vi.mock('@presentation/pets/hooks/usePets', () => ({
  usePet: mocks.usePet,
  usePetMedicalRecords: mocks.usePetMedicalRecords,
  usePetPermissions: mocks.usePetPermissions,
}));

vi.mock('@presentation/pets/hooks/usePetMutations', () => ({
  useCreatePetCareTask: mocks.useCreatePetCareTask,
  useCreateMedicalRecord: mocks.useCreateMedicalRecord,
  useDeleteMedicalRecord: mocks.useDeleteMedicalRecord,
  useSetPetPermission: mocks.useSetPetPermission,
  useArchivePet: mocks.useArchivePet,
}));

import type { Pet } from '@domain/pets/entities/Pet';
import { PetDetailScreen } from '@presentation/pets/screens/PetDetailScreen';

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

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

const has = (renderer: ReactTestRenderer, testID: string): boolean =>
  renderer.root.findAll((node) => node.props.testID === testID).length > 0;

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  act(() => {
    (node?.props.onPress as (() => void) | undefined)?.();
  });
};

const type = (renderer: ReactTestRenderer, testID: string, value: string): void => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  act(() => {
    (node?.props.onChangeText as ((next: string) => void) | undefined)?.(value);
  });
};

const idle = { isPending: false, isError: false, isSuccess: false, mutate: vi.fn() };
const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <PetDetailScreen route={{ params: { petId: 'p1' } } as never} navigation={navigation as never} />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.usePet.mockReturnValue({ data: pet, isLoading: false, isError: false });
  mocks.usePetMedicalRecords.mockReturnValue({ data: [], isLoading: false, isError: false });
  mocks.usePetPermissions.mockReturnValue({ data: null, isLoading: false, isError: false });
  mocks.useCreatePetCareTask.mockReturnValue(idle);
  mocks.useCreateMedicalRecord.mockReturnValue(idle);
  mocks.useDeleteMedicalRecord.mockReturnValue(idle);
  mocks.useSetPetPermission.mockReturnValue(idle);
  mocks.useArchivePet.mockReturnValue(idle);
});

describe('PetDetailScreen — pet care tasks (TD-021)', () => {
  it('offers the action that was missing from the app', () => {
    const renderer = render();

    expect(has(renderer, 'pet-task-open')).toBe(true);
    expect(textOf(renderer)).toContain('Tareas de cuidado');
  });

  it('names the pet the task will be attached to', () => {
    expect(textOf(render())).toContain('ligada a Luna');
  });

  it('hides the form until the action is pressed', () => {
    const renderer = render();
    expect(has(renderer, 'pet-task-title')).toBe(false);

    press(renderer, 'pet-task-open');
    expect(has(renderer, 'pet-task-title')).toBe(true);
  });

  it('submits the title and the due date', () => {
    const create = { ...idle, mutate: vi.fn() };
    mocks.useCreatePetCareTask.mockReturnValue(create);

    const renderer = render();
    press(renderer, 'pet-task-open');
    type(renderer, 'pet-task-title', '  Sacar a pasear  ');
    type(renderer, 'pet-task-due-date', '2026-09-20');
    press(renderer, 'pet-task-submit');

    expect(create.mutate).toHaveBeenCalledTimes(1);
    const [payload] = create.mutate.mock.calls[0] as [{ title: string; dueDate: string }];
    expect(payload).toEqual({ title: 'Sacar a pasear', dueDate: '2026-09-20' });
  });

  it('omits rotative when the toggle is left off', () => {
    const create = { ...idle, mutate: vi.fn() };
    mocks.useCreatePetCareTask.mockReturnValue(create);

    const renderer = render();
    press(renderer, 'pet-task-open');
    type(renderer, 'pet-task-title', 'Pasear');
    press(renderer, 'pet-task-submit');

    const [payload] = create.mutate.mock.calls[0] as [Record<string, unknown>];
    expect('rotative' in payload).toBe(false);
  });

  it('sends rotative when the toggle is switched on', () => {
    const create = { ...idle, mutate: vi.fn() };
    mocks.useCreatePetCareTask.mockReturnValue(create);

    const renderer = render();
    press(renderer, 'pet-task-open');
    type(renderer, 'pet-task-title', 'Pasear');
    press(renderer, 'pet-task-rotative');
    press(renderer, 'pet-task-submit');

    const [payload] = create.mutate.mock.calls[0] as [Record<string, unknown>];
    expect(payload.rotative).toBe(true);
  });

  it('does not submit without a title', () => {
    const create = { ...idle, mutate: vi.fn() };
    mocks.useCreatePetCareTask.mockReturnValue(create);

    const renderer = render();
    press(renderer, 'pet-task-open');
    press(renderer, 'pet-task-submit');

    expect(create.mutate).not.toHaveBeenCalled();
    const button = renderer.root.findAll(
      (node) => node.props.testID === 'pet-task-submit' && node.props.accessibilityState,
    )[0];
    expect(button?.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('shows the backend refusal instead of swallowing it', () => {
    mocks.useCreatePetCareTask.mockReturnValue({
      ...idle,
      isError: true,
      error: { message: 'Insufficient Pets permission level for this action' },
    });

    const renderer = render();
    press(renderer, 'pet-task-open');

    expect(textOf(renderer)).toContain('Insufficient Pets permission level for this action');
  });

  it('starts the due date on today, so the field is never empty', () => {
    const renderer = render();
    press(renderer, 'pet-task-open');

    const input = renderer.root.findAll((node) => node.props.testID === 'pet-task-due-date')[0];
    expect(input?.props.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
