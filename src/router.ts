import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

import { isStaleChunkError, reloadOnceForUpdate } from './lib/app-update'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/prenom', name: 'name', component: () => import('./views/NameView.vue') },
    { path: '/famille/:familyId', name: 'family', component: () => import('./views/FamilyView.vue'), props: true },
    { path: '/bilan', name: 'bilan', component: () => import('./views/BilanView.vue') },
    { path: '/export', name: 'export', component: () => import('./views/ExportView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 120 }
    return { top: 0 }
  },
})

// Écran introuvable après une mise à jour : recharger récupère la nouvelle version.
router.onError((error, to) => {
  if (isStaleChunkError(error) && reloadOnceForUpdate()) return
  console.error(error, to.fullPath)
})
