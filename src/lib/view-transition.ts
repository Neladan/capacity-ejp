import { reducedMotion } from './haptics'

/** Passe par l'API View Transitions quand elle existe ; sinon, change simplement d'état. */
export async function withViewTransition(update: () => void | Promise<void>) {
  const doc = document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } }
  if (!doc.startViewTransition || reducedMotion()) {
    await update()
    return
  }
  await doc.startViewTransition(update).finished.catch(() => {})
}
