/**
 * Query keys for the push registration state.
 *
 * Deliberately dependency-free: keeping them in the hook module would drag the
 * auth store (and therefore expo-secure-store and react-native) into every
 * consumer, including the node-environment test suite that imports the
 * notification mutations.
 */

/**
 * Keyed per account so a second user signing in on the same device gets their
 * own registration entry.
 */
export const pushRegistrationStatusQueryKey = (userId: string | null) =>
  ['push-registration', userId] as const;

/** Prefix for prefix-matching invalidation (TanStack matches by default). */
export const pushRegistrationStatusQueryPrefix = ['push-registration'] as const;
