/**
 * Let pending promise chains settle, without a wall-clock sleep.
 *
 * The hook tests drive react-query through mocked repositories whose methods
 * resolve immediately (`mockResolvedValue`), so the only work in flight is
 * microtasks plus the macrotask react-query queues to notify its observers.
 *
 * Those tests used to wait a fixed number of milliseconds — anywhere from 0 to
 * 100, picked per file — before asserting. That makes a test pass while the
 * thing it asserts is still false, and fail when the machine is busy (TD-030).
 * Draining the queues per turn removes the arbitrary duration.
 *
 * This is a drain, not a condition wait: it cannot re-check an assertion that
 * is still false. Where an assertion needs a real condition to hold, use
 * `vi.waitFor` instead of a longer drain.
 */
export const flushQueries = async (turns = 5): Promise<void> => {
  for (let turn = 0; turn < turns; turn += 1) {
    // A `setTimeout(0)` yields to both the microtask queue and one macrotask
    // turn, which is what react-query needs to flush its observer callbacks.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
};
