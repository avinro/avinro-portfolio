// Mock for `next-intl/routing` — the real package is not resolvable in the Vitest
// node environment. `defineRouting` simply returns its config, which is all the
// app's `src/i18n/routing.ts` needs from it.
export function defineRouting<T>(config: T): T {
  return config;
}
