import type { SavingsGoalDto } from '@data/savings/dtos/savingsDtos';
import {
  toCreateContributionRequest,
  toCreateSavingsGoalRequest,
  toMarkCellResult,
  toPaginatedSavingsGoals,
  toSavingsCell,
  toSavingsContribution,
  toSavingsGoal,
  toSavingsMovement,
} from '@data/savings/mappers/savingsMappers';
import { describe, expect, it } from 'vitest';

const goalDto: SavingsGoalDto = {
  id: 'g1',
  createdBy: 'u1',
  scope: 'HOUSEHOLD',
  householdId: 'h1',
  name: 'Vacaciones',
  notes: null,
  targetAmount: '1200.00',
  currency: 'EUR',
  boardPreset: 'MEDIUM',
  contributionMode: null,
  quotaAmount: null,
  savedAmount: '0.00',
  status: 'OPEN',
  completedAt: null,
  cancelledAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const cellDto = {
  id: 'c1',
  goalId: 'g1',
  denomination: '50.00',
  position: 1,
  isMarked: false,
  markedBy: null,
  markedAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const movementDto = {
  id: 'm1',
  goalId: 'g1',
  cellId: 'c1',
  createdBy: 'u1',
  type: 'MARK',
  amount: '50.00',
  balanceAfter: '50.00',
  reversalOfId: null,
  createdAt: '2026-09-15T00:00:00.000Z',
};

describe('savingsMappers', () => {
  it('normalises optional goal fields to null', () => {
    const goal = toSavingsGoal(goalDto);

    expect(goal.householdId).toBe('h1');
    expect(goal.notes).toBeNull();
    expect(goal.contributionMode).toBeNull();
    expect(goal.quotaAmount).toBeNull();
    expect(goal.completedAt).toBeNull();
  });

  it('defaults a missing householdId to null (personal goal)', () => {
    const { householdId: _omit, ...rest } = goalDto;
    const goal = toSavingsGoal({ ...rest, scope: 'PERSONAL' });

    expect(goal.householdId).toBeNull();
    expect(goal.scope).toBe('PERSONAL');
  });

  it('maps a cell', () => {
    const cell = toSavingsCell(cellDto);

    expect(cell.denomination).toBe('50.00');
    expect(cell.isMarked).toBe(false);
    expect(cell.markedBy).toBeNull();
  });

  it('maps a movement', () => {
    const movement = toSavingsMovement(movementDto);

    expect(movement.type).toBe('MARK');
    expect(movement.balanceAfter).toBe('50.00');
    expect(movement.reversalOfId).toBeNull();
  });

  it('maps a contribution (month defaults to null)', () => {
    const contribution = toSavingsContribution({
      id: 'ct1',
      savingsGoalId: 'g1',
      userId: 'u1',
      amount: '25.00',
      createdAt: '2026-09-15T00:00:00.000Z',
    });

    expect(contribution.month).toBeNull();
    expect(contribution.savingsGoalId).toBe('g1');
  });

  it('maps the mark result including status transition', () => {
    const result = toMarkCellResult({
      movement: movementDto,
      cell: { ...cellDto, isMarked: true, markedBy: 'u1' },
      goal: { ...goalDto, status: 'COMPLETED' },
      statusChanged: true,
      previousStatus: 'OPEN',
      newStatus: 'COMPLETED',
    });

    expect(result.statusChanged).toBe(true);
    expect(result.previousStatus).toBe('OPEN');
    expect(result.newStatus).toBe('COMPLETED');
    expect(result.cell.isMarked).toBe(true);
  });

  it('maps a paginated goal list', () => {
    const page = toPaginatedSavingsGoals({
      goals: [goalDto],
      total: 1,
      page: 1,
      limit: 20,
    });

    expect(page.goals).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.limit).toBe(20);
  });

  it('builds the create request, omitting undefined optionals', () => {
    const body = toCreateSavingsGoalRequest({
      name: 'Vacaciones',
      targetAmount: '1200.00',
      currency: 'EUR',
      boardPreset: 'MEDIUM',
    });

    expect(body).toEqual({
      name: 'Vacaciones',
      targetAmount: '1200.00',
      currency: 'EUR',
      boardPreset: 'MEDIUM',
    });
    expect('denominations' in body).toBe(false);
    expect('quotaAmount' in body).toBe(false);
  });

  it('includes custom denominations and quota when provided', () => {
    const body = toCreateSavingsGoalRequest({
      name: 'Coche',
      targetAmount: '5000.00',
      currency: 'EUR',
      boardPreset: 'CUSTOM',
      denominations: ['10', '20', '50'],
      contributionMode: 'QUOTA',
      quotaAmount: '100.00',
    });

    expect(body.denominations).toEqual(['10', '20', '50']);
    expect(body.contributionMode).toBe('QUOTA');
    expect(body.quotaAmount).toBe('100.00');
  });

  it('builds the contribution request, omitting an absent month', () => {
    expect(toCreateContributionRequest({ amount: '25.00' })).toEqual({ amount: '25.00' });
    expect(toCreateContributionRequest({ amount: '25.00', month: '2026-09' })).toEqual({
      amount: '25.00',
      month: '2026-09',
    });
  });
});
