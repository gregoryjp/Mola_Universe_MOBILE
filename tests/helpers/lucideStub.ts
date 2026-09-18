/**
 * `lucide-react-native` stand-in for component tests.
 *
 * The real package renders through `react-native-svg`, which imports
 * Flow-annotated `react-native` internals the Vite pipeline cannot parse in this
 * plain node test environment (same root cause `reactNativeStub.ts` documents).
 *
 * `vitest.config.ts` aliases the package to this file, so every suite gets it
 * without a per-file `vi.mock`. That matters because the UI barrel exports these
 * icons transitively: a single component importing one icon is enough to pull
 * the real package into every suite that touches the barrel.
 *
 * The icons are named exports, mirroring the real module shape — not a `Proxy`,
 * whose `get` trap answers every key (including `then`) and would make the
 * module look like a thenable to the dynamic-import interop.
 */

const IconStub = (): null => null;

/* Every icon name imported anywhere under `src/`. */
export const Bell = IconStub;
export const Calendar = IconStub;
export const Cat = IconStub;
export const Check = IconStub;
export const ChevronLeft = IconStub;
export const ChevronRight = IconStub;
export const House = IconStub;
export const Image = IconStub;
export const ListTodo = IconStub;
export const Package = IconStub;
export const PawPrint = IconStub;
export const PiggyBank = IconStub;
export const Plus = IconStub;
export const RefreshCw = IconStub;
export const ShieldAlert = IconStub;
export const ShoppingCart = IconStub;
export const TriangleAlert = IconStub;
export const User = IconStub;
export const Users = IconStub;
export const Wallet = IconStub;
