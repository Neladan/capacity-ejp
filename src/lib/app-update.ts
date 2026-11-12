import { registerSW } from 'virtual:pwa-register'
import { useAnswers } from '../store/answers'

const RELOAD_KEY = 'ejp-rechargement'

/** Recharge la page après avoir enregistré les réponses en attente. */
export function reloadSafely() {
  try {
    useAnswers().flush()
  } catch {
    /* rien à enregistrer */
  }
  window.location.reload()
}

/**
 * Un module chargé à la demande (PDF, écrans) introuvable signifie presque toujours
 * que la page tourne sur une ancienne version alors qu'une nouvelle a été déployée.
 */
export function isStaleChunkError(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to fetch|ChunkLoadError|Unable to preload CSS/i.test(message)
}

/**
 * Demande au service worker de vérifier s'il existe une nouvelle version, attend qu'elle prenne
 * la main (10 s au plus), puis recharge. Sans cette attente, la page rechargée resterait l'ancienne.
 */
export async function updateThenReload() {
  const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined
  const reg = await sw?.getRegistration().catch(() => undefined)
  if (sw && reg) {
    const takenOver = new Promise<void>((resolve) => {
      sw.addEventListener('controllerchange', () => resolve(), { once: true })
      setTimeout(resolve, 10_000)
    })
    await reg.update().catch(() => {})
    if (reg.installing || reg.waiting) await takenOver
  }
  reloadSafely()
}

/** Lance une mise à jour suivie d'un rechargement, une seule fois ; renvoie false si on vient déjà de le faire. */
export function reloadOnceForUpdate(): boolean {
  let last = 0
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    /* sans sessionStorage, on tente quand même */
  }
  if (Date.now() - last < 30_000) return false
  void updateThenReload()
  return true
}

export function setupAppUpdates() {
  // Nouvelle version installée par le service worker : on recharge pour l'utiliser tout de suite.
  registerSW({
    immediate: true,
    onNeedReload: reloadSafely,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // Le navigateur ne vérifie pas toujours les mises à jour de lui-même : on le lui demande
      // au chargement, puis à chaque retour sur l'app (onglet resté ouvert sur le téléphone).
      const check = () => registration.update().catch(() => {})
      check()
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check())
    },
  })

}
