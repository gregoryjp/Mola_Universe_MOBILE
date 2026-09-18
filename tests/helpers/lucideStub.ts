/**
 * Minimal `lucide-react-native` stub for component tests.
 *
 * The real package renders through `react-native-svg`, which itself imports
 * Flow-annotated `react-native` internals the Vite pipeline cannot parse in
 * this plain node test environment (same root cause `reactNativeStub.ts`
 * documents for `react-native` proper).
 *
 * This lists every icon name currently imported anywhere in the app, mirroring
 * `reactNativeStub`'s explicit style rather than a `Proxy` — a `Proxy` whose
 * `get` trap answers every key (including `then`) makes the mocked module look
 * like a thenable to the dynamic-import interop, which then awaits it forever.
 */

const IconStub = (): null => null;

export const lucideStub = {
  Bell: IconStub,
  Calendar: IconStub,
  Cat: IconStub,
  House: IconStub,
  Image: IconStub,
  ListTodo: IconStub,
  PawPrint: IconStub,
  PiggyBank: IconStub,
  Plus: IconStub,
  ShieldAlert: IconStub,
  ShoppingCart: IconStub,
  User: IconStub,
  Users: IconStub,
  Wallet: IconStub,
};
