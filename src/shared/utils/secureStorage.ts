import type { Session } from '@domain/auth/entities/Session';
import { readItem, removeItem, writeItem } from './keyValueStore';

const SESSION_KEY = 'mola.auth.session';

export const saveSession = async (session: Session): Promise<void> => {
  await writeItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = async (): Promise<Session | null> => {
  const raw = await readItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await removeItem(SESSION_KEY);
};
