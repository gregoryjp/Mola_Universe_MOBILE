import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { MeowCapabilityParams } from '@domain/meow/entities/Meow';
import { Button, Input } from '@presentation/components/ui';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import type { CapabilityMeta } from '../capabilities';
import { type Option, OptionPicker } from './OptionPicker';
import { SavingsGoalPicker } from './SavingsGoalPicker';
import { ShoppingListPicker } from './ShoppingListPicker';
import { TaskPicker } from './TaskPicker';

/** Enums the backend validates with `literal()` — values must match exactly. */
const TASK_CATEGORIES: Option[] = [
  { id: 'GENERAL', label: 'General' },
  { id: 'PETS', label: 'Mascotas' },
  { id: 'BABY', label: 'Bebé' },
  { id: 'PLANTS', label: 'Plantas' },
  { id: 'CUSTOM', label: 'Otra' },
];

const TASK_PRIORITIES: Option[] = [
  { id: 'LOW', label: 'Baja' },
  { id: 'MEDIUM', label: 'Media' },
  { id: 'HIGH', label: 'Alta' },
];

const EVENT_TYPES: Option[] = [
  { id: 'GENERAL', label: 'General' },
  { id: 'BIRTHDAY', label: 'Cumpleaños' },
  { id: 'APPOINTMENT', label: 'Cita' },
  { id: 'PAYMENT', label: 'Pago' },
  { id: 'SUBSCRIPTION', label: 'Suscripción' },
  { id: 'INSURANCE', label: 'Seguro' },
  { id: 'MAINTENANCE', label: 'Mantenimiento' },
  { id: 'PET', label: 'Mascota' },
  { id: 'TRIP', label: 'Viaje' },
  { id: 'CUSTOM', label: 'Otro' },
];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

interface Props {
  meta: CapabilityMeta;
  isSubmitting: boolean;
  onSubmit: (params: MeowCapabilityParams) => void;
}

/**
 * Params panel for one capability. Every field is typed, because structured
 * execution is the point: the app knows the capability and supplies explicit
 * params, so no free-text parsing and no AI call is involved (ADR-0025).
 */
export const CapabilityForm = ({ meta, isSubmitting, onSubmit }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const styles = useThemedStyles(makeStyles);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(todayIso());
  const [startAt, setStartAt] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [eventType, setEventType] = useState('GENERAL');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('ud');
  const [amount, setAmount] = useState('');

  const householdScoped = householdId === null ? {} : { householdId };

  const buildParams = (): MeowCapabilityParams => {
    switch (meta.form) {
      case 'createTask':
        return { title, dueDate, category, priority, ...householdScoped };
      case 'createEvent':
        return { title, startAt, type: eventType, ...householdScoped };
      case 'completeTask':
        return taskId === null ? {} : { taskId };
      case 'clearTaskAssignee':
        return taskId === null ? {} : { taskId };
      case 'addShoppingItem':
        return listId === null ? {} : { listId, name: itemName, quantity, unit };
      case 'contributeSavings':
        return goalId === null ? {} : { goalId, amount };
      default:
        return householdScoped;
    }
  };

  const canSubmit = ((): boolean => {
    switch (meta.form) {
      case 'createTask':
        return title.trim().length > 0 && dueDate.trim().length > 0;
      case 'createEvent':
        return title.trim().length > 0 && startAt.trim().length > 0;
      case 'completeTask':
      case 'clearTaskAssignee':
        return taskId !== null;
      case 'addShoppingItem':
        return (
          listId !== null &&
          itemName.trim().length > 0 &&
          quantity.trim().length > 0 &&
          unit.trim().length > 0
        );
      case 'contributeSavings':
        return goalId !== null && amount.trim().length > 0;
      default:
        return true;
    }
  })();

  const targetHint =
    householdId === null ? 'Se aplicará a tus datos personales' : 'Se aplicará al hogar activo';

  return (
    <View style={styles.form}>
      {(meta.form === 'createTask' || meta.form === 'createEvent') && (
        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Título"
          required
          testID={`meow-${meta.id}-title`}
        />
      )}

      {meta.form === 'createTask' && (
        <>
          <Input
            label="Vence"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            helperText="Fecha en formato ISO (solo día)."
            required
            testID={`meow-${meta.id}-dueDate`}
          />
          <Text style={styles.fieldLabel}>Categoría</Text>
          <OptionPicker
            options={TASK_CATEGORIES}
            selectedId={category}
            onSelect={setCategory}
            emptyLabel=""
            accessibilityLabel="Elegir categoría"
          />
          <Text style={styles.fieldLabel}>Prioridad</Text>
          <OptionPicker
            options={TASK_PRIORITIES}
            selectedId={priority}
            onSelect={setPriority}
            emptyLabel=""
            accessibilityLabel="Elegir prioridad"
          />
        </>
      )}

      {meta.form === 'createEvent' && (
        <>
          <Input
            label="Inicio"
            value={startAt}
            onChangeText={setStartAt}
            placeholder="Inicio (ISO, ej. 2026-09-20T18:00:00Z)"
            required
            testID={`meow-${meta.id}-startAt`}
          />
          <Text style={styles.fieldLabel}>Tipo</Text>
          <OptionPicker
            options={EVENT_TYPES}
            selectedId={eventType}
            onSelect={setEventType}
            emptyLabel=""
            accessibilityLabel="Elegir tipo de evento"
          />
        </>
      )}

      {(meta.form === 'completeTask' || meta.form === 'clearTaskAssignee') && (
        <>
          <Text style={styles.fieldLabel}>Tarea</Text>
          <TaskPicker selectedId={taskId} onSelect={setTaskId} />
        </>
      )}

      {meta.form === 'addShoppingItem' && (
        <>
          <Text style={styles.fieldLabel}>Lista</Text>
          <ShoppingListPicker selectedId={listId} onSelect={setListId} />
          <Input
            label="Artículo"
            value={itemName}
            onChangeText={setItemName}
            placeholder="Artículo"
            required
            testID={`meow-${meta.id}-name`}
          />
          <Input
            label="Cantidad"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            type="number"
            required
            testID={`meow-${meta.id}-quantity`}
          />
          <Input
            label="Unidad"
            value={unit}
            onChangeText={setUnit}
            placeholder="ud"
            required
            testID={`meow-${meta.id}-unit`}
          />
        </>
      )}

      {meta.form === 'contributeSavings' && (
        <>
          <Text style={styles.fieldLabel}>Meta</Text>
          <SavingsGoalPicker selectedId={goalId} onSelect={setGoalId} />
          <Input
            label="Importe"
            value={amount}
            onChangeText={setAmount}
            placeholder="50"
            type="number"
            required
            testID={`meow-${meta.id}-amount`}
          />
        </>
      )}

      {meta.form === 'createTask' || meta.form === 'createEvent' ? (
        <Text style={styles.hint}>{targetHint}</Text>
      ) : null}

      <Button
        label="Ejecutar"
        onPress={() => onSubmit(buildParams())}
        disabled={!canSubmit}
        loading={isSubmitting}
        size="lg"
        testID={`meow-${meta.id}-submit`}
        accessibilityHint="Ejecuta esta capability de Meow"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  form: {
    gap: spacing.s3,
    paddingTop: spacing.s2,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
});
