// Stub performance monitoring — no-ops in dev / Expo Go.
// TODO: Wire up Firebase Performance once using a dev build.

export async function startTrace(_name: string) {
  return {
    stop: () => Promise.resolve(),
    putAttribute: (_key: string, _value: string) => {},
    incrementMetric: (_name: string, _amount?: number) => {},
  }
}

export async function measureAsync<T>(_name: string, fn: () => Promise<T>): Promise<T> {
  return fn()
}

export function createHttpMetric(_url: string, _method: string) {
  return null
}
