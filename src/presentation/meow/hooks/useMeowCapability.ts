import { meowRepository } from '@data/meow/repositories/MeowRepositoryImpl';
import type {
  MeowCapability,
  MeowCapabilityParams,
  MeowCapabilityResult,
} from '@domain/meow/entities/Meow';
import { AppError } from '@shared/errors/AppError';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Capabilities that change data, mapped to the query root they invalidate.
 * Without this, creating a task through Meow would leave the tasks tab stale.
 */
const INVALIDATION_ROOTS: Partial<Record<MeowCapability, readonly string[]>> = {
  CREATE_TASK: ['tasks'],
  COMPLETE_TASK: ['tasks'],
  REASSIGN_TASK: ['tasks'],
  CREATE_EVENT: ['calendar'],
  ADD_SHOPPING_ITEM: ['shopping'],
  CONTRIBUTE_SAVINGS: ['savings'],
};

export interface ExecuteCapabilityInput {
  capability: MeowCapability;
  params: MeowCapabilityParams;
}

export const useMeowCapability = () => {
  const queryClient = useQueryClient();

  return useMutation<MeowCapabilityResult, AppError, ExecuteCapabilityInput>({
    mutationFn: async ({ capability, params }) => {
      const result = await meowRepository.executeCapability(capability, params);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: (_result, variables) => {
      const root = INVALIDATION_ROOTS[variables.capability];
      if (root) void queryClient.invalidateQueries({ queryKey: root });
    },
  });
};
