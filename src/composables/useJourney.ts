import { nextTick, ref } from 'vue'
import { router } from '../router'
import { itemIndex, themeIndex } from '../data/catalogue'
import { withViewTransition } from '../lib/view-transition'
import { reducedMotion } from '../lib/haptics'

/** État d'interface partagé par le parcours (non enregistré). */
export const searchOpen = ref(false)
export const sheetOpen = ref(false)
export const onlyMine = ref(false)
export const hideSeen = ref(false)
export const highlightId = ref<number | null>(null)
export const currentThemeId = ref<string | null>(null)

function currentFamilyId(): string | null {
  const r = router.currentRoute.value
  return r.name === 'family' ? String(r.params.familyId) : null
}

/** Défile jusqu'à un élément, puis corrige une fois le rendu stabilisé. */
export async function scrollToId(id: string, block: ScrollLogicalPosition = 'start') {
  await nextTick()
  const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth'
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ block, behavior: 'auto' })
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  document.getElementById(id)?.scrollIntoView({ block, behavior })
}

export async function goToFamily(familyId: string, themeId?: string) {
  if (currentFamilyId() !== familyId) {
    await withViewTransition(async () => {
      await router.push({ name: 'family', params: { familyId } })
      window.scrollTo({ top: 0 })
    })
  }
  if (themeId) await scrollToId(`theme-${themeId}`)
}

export async function goToTheme(themeId: string) {
  const ref_ = themeIndex.get(themeId)
  if (ref_) await goToFamily(ref_.family.id, themeId)
}

export async function goToItem(itemId: number) {
  const ref_ = itemIndex.get(itemId)
  if (!ref_) return
  // Les filtres pourraient cacher l'élément cherché.
  onlyMine.value = false
  hideSeen.value = false
  await goToFamily(ref_.family.id)
  await scrollToId(`element-${itemId}`, 'center')
  highlightId.value = itemId
  setTimeout(() => {
    if (highlightId.value === itemId) highlightId.value = null
  }, 1800)
}
