import type { MeowCapability } from '@domain/meow/entities/Meow';

export type CapabilityGroup = 'READ' | 'WRITE' | 'PREMIUM';

/** Which params panel a capability needs, or `none` to run straight away. */
export type CapabilityFormKind =
  | 'none'
  | 'createTask'
  | 'createEvent'
  | 'completeTask'
  | 'clearTaskAssignee'
  | 'addShoppingItem'
  | 'contributeSavings';

export interface CapabilityMeta {
  id: MeowCapability;
  label: string;
  description: string;
  group: CapabilityGroup;
  form: CapabilityFormKind;
  /**
   * `true` for the capabilities the backend rejects with INVALID_INPUT unless a
   * `householdId` is supplied (`VIEW_EXPENSE_BALANCE`, `VIEW_PET_CARE`).
   */
  requiresHousehold: boolean;
}

export const CAPABILITY_GROUP_LABELS: Record<CapabilityGroup, string> = {
  READ: 'Consultar',
  WRITE: 'Hacer',
  PREMIUM: 'Premium',
};

/** The 12 capabilities, in the backend's own order. */
export const MEOW_CAPABILITY_META: readonly CapabilityMeta[] = [
  {
    id: 'VIEW_MY_DAY',
    label: 'Mi día',
    description: 'El resumen del día que ya calcula el panel.',
    group: 'READ',
    form: 'none',
    requiresHousehold: false,
  },
  {
    id: 'VIEW_INVENTORY',
    label: 'Inventario',
    description: 'Cuántos artículos tienes en inventario.',
    group: 'READ',
    form: 'none',
    requiresHousehold: false,
  },
  {
    id: 'VIEW_EXPENSE_BALANCE',
    label: 'Balance de gastos',
    description: 'Total de gastos del hogar activo.',
    group: 'READ',
    form: 'none',
    requiresHousehold: true,
  },
  {
    id: 'VIEW_SAVINGS',
    label: 'Metas de ahorro',
    description: 'Cuántas metas de ahorro tienes activas.',
    group: 'READ',
    form: 'none',
    requiresHousehold: false,
  },
  {
    id: 'VIEW_PET_CARE',
    label: 'Mascotas',
    description: 'Cuántas mascotas hay registradas en el hogar.',
    group: 'READ',
    form: 'none',
    requiresHousehold: true,
  },
  {
    id: 'CREATE_TASK',
    label: 'Crear tarea',
    description: 'Crea una tarea personal o del hogar.',
    group: 'WRITE',
    form: 'createTask',
    requiresHousehold: false,
  },
  {
    id: 'COMPLETE_TASK',
    label: 'Completar tarea',
    description: 'Marca una tarea como completada.',
    group: 'WRITE',
    form: 'completeTask',
    requiresHousehold: false,
  },
  {
    id: 'REASSIGN_TASK',
    label: 'Dejar tarea sin asignar',
    description:
      'Quita el responsable de una tarea. Reasignar a otra persona no es posible: el contrato no expone nombres de miembro.',
    group: 'WRITE',
    form: 'clearTaskAssignee',
    requiresHousehold: false,
  },
  {
    id: 'CREATE_EVENT',
    label: 'Crear evento',
    description: 'Crea un evento personal o del hogar.',
    group: 'WRITE',
    form: 'createEvent',
    requiresHousehold: false,
  },
  {
    id: 'ADD_SHOPPING_ITEM',
    label: 'Añadir a la compra',
    description: 'Añade un artículo a una lista de la compra.',
    group: 'WRITE',
    form: 'addShoppingItem',
    requiresHousehold: false,
  },
  {
    id: 'CONTRIBUTE_SAVINGS',
    label: 'Aportar a una meta',
    description: 'Registra un aporte en una meta de ahorro.',
    group: 'WRITE',
    form: 'contributeSavings',
    requiresHousehold: false,
  },
  {
    id: 'START_PREMIUM_MODULE',
    label: 'Módulos premium',
    description: 'Move, English y Juegos: qué hay disponible de verdad.',
    group: 'PREMIUM',
    form: 'none',
    requiresHousehold: false,
  },
];

export const capabilitiesOf = (group: CapabilityGroup): CapabilityMeta[] =>
  MEOW_CAPABILITY_META.filter((meta) => meta.group === group);
