// RNTL 14 ships its jest matchers built-in (auto-extended on import), so no
// matcher setup is required here. Kept as the Vitest `setupFiles` entry point
// for future global test setup (mocks, polyfills).

// React requires this flag to allow `act(...)` outside of a DOM renderer; our
// hook tests drive state through react-test-renderer.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export {};
