import { readItem, removeItem, writeItem } from './keyValueStore';

const ACTIVE_HOUSEHOLD_KEY = 'mola.households.active';

/**
 * Persists the active household so the choice survives a restart (P0-4).
 *
 * The value is stored as an envelope, not the bare id, so "never chose" (no key
 * at all) is distinguishable from "chose Personal" (`{ id: null }`). Without that
 * distinction the default-to-first-household rule would silently override a
 * deliberate "Personal" selection on the next launch.
 */
export const saveActiveHouseholdId = async (id: string | null): Promise<void> => {
  await writeItem(ACTIVE_HOUSEHOLD_KEY, JSON.stringify({ id }));
};

/** `null` means no choice was ever persisted (first run after install/logout). */
export const loadActiveHouseholdId = async (): Promise<{ id: string | null } | null> => {
  const raw = await readItem(ACTIVE_HOUSEHOLD_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown };
    return { id: typeof parsed.id === 'string' ? parsed.id : null };
  } catch {
    return null;
  }
};

export const clearActiveHouseholdId = (): Promise<void> => removeItem(ACTIVE_HOUSEHOLD_KEY);
