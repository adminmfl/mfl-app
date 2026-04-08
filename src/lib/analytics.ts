// Stub analytics — no-ops in dev / Expo Go.
// TODO: Wire up Firebase Analytics once using a dev build.

export function logScreenView(_screenName: string, _screenClass?: string) {}
export function logEvent(_name: string, _params?: Record<string, string | number>) {}
export function setUser(_userId: string | null) {}
export function setUserProperty(_name: string, _value: string | null) {}
export function logUserLogin(_method: string) {}
export function logUserSignUp(_method: string) {}
export function logSearchEvent(_searchTerm: string) {}
export function logShareEvent(_contentType: string, _itemId: string) {}
export function logPurchaseEvent(_params: { value: number; currency: string; transactionId: string }) {}
