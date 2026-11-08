/** Accès à localStorage qui ne lève jamais d'exception (navigation privée, quota plein, accès bloqué). */
export interface SafeStorage {
  get(key: string): string | null
  set(key: string, value: string): boolean
  remove(key: string): void
}

export function createSafeStorage(getStore: () => Storage | undefined = () => globalThis.localStorage): SafeStorage {
  return {
    get(key) {
      try {
        return getStore()?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        const s = getStore()
        if (!s) return false
        s.setItem(key, value)
        return true
      } catch {
        return false
      }
    },
    remove(key) {
      try {
        getStore()?.removeItem(key)
      } catch {
        /* rien à faire */
      }
    },
  }
}
