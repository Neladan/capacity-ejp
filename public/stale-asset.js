// Servi par nginx à la place d'un fichier /assets/*.js qui n'existe plus : la page tourne sur une
// ancienne version gardée en cache par le service worker. On retire ce service worker et ses caches,
// puis on recharge pour repartir sur la version à jour. Les réponses (localStorage) ne sont pas touchées.
const KEY = 'ejp-secours-version'

async function rescue() {
  if (typeof window === 'undefined') return // chargé dans un worker : rien à faire
  try {
    if (Date.now() - Number(sessionStorage.getItem(KEY) || 0) < 30000) return // évite une boucle
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch (e) {
    /* sans sessionStorage, on tente quand même */
  }
  try {
    const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? []
    await Promise.all(registrations.map((r) => r.unregister()))
  } catch (e) {
    /* pas de service worker */
  }
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  } catch (e) {
    /* pas de cache */
  }
  window.location.reload()
}

rescue()
export {}
