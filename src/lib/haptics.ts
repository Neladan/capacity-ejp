/** Retour haptique très court, seulement si le navigateur le permet. */
export function tick(ms = 8) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && !reducedMotion()) navigator.vibrate(ms)
  } catch {
    /* sans importance */
  }
}

export function reducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
