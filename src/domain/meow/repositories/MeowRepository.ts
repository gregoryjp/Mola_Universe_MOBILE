import type { MeowCapability, MeowCapabilityParams, MeowCapabilityResult } from '../entities/Meow';

/** Typed error forwarded from the backend (ADR-0010). */
export interface MeowError {
  code: string;
  message: string;
  statusCode: number;
}

export type MeowResult<T> = { success: true; value: T } | { success: false; error: MeowError };

/**
 * Meow port. Maps 1:1 to the verified backend route
 * `POST /meow/capabilities/:capability` (modules/meow/routes/meowRoutes.ts).
 *
 * `POST /meow/ask` (free chat) is deliberately not modelled: the product
 * decision is capabilities only, no free chat and no history.
 */
export interface MeowRepository {
  executeCapability(
    capability: MeowCapability,
    params: MeowCapabilityParams,
  ): Promise<MeowResult<MeowCapabilityResult>>;
}
