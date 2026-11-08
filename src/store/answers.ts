import { computed, reactive, readonly } from 'vue'
import { catalogue, totals, type Family, type LevelId, type Theme } from '../data/catalogue'
import { createSafeStorage, type SafeStorage } from '../lib/storage'
import {
  MAX_STRENGTHS,
  STORAGE_KEY,
  createInitialState,
  hasProgress,
  parseStored,
  type AppState,
  type Position,
} from './state'

export type LevelCounts = Record<LevelId, number> & { total: number }

function emptyCounts(): LevelCounts {
  return { acquis: 0, ameliorer: 0, essayer: 0, total: 0 }
}

export interface StoreOptions {
  storage?: SafeStorage
  /** Délai de regroupement des écritures, en ms. */
  debounce?: number
  now?: () => number
}

export function createAnswersStore(options: StoreOptions = {}) {
  const storage = options.storage ?? createSafeStorage()
  const debounce = options.debounce ?? 250
  const now = options.now ?? Date.now

  const state = reactive<AppState>(parseStored(storage.get(STORAGE_KEY)))
  let timer: ReturnType<typeof setTimeout> | null = null
  let dirty = false

  /** Écrit les changements en attente. Sans changement, n'écrit rien : un autre onglet a pu enregistrer entre-temps. */
  function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (!dirty) return
    dirty = false
    storage.set(STORAGE_KEY, JSON.stringify(state))
  }

  function touch() {
    state.updatedAt = now()
    dirty = true
    if (debounce <= 0) return flush()
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, debounce)
  }

  function levelOf(id: number): LevelId | null {
    return state.answers[String(id)] ?? null
  }

  function setLevel(id: number, level: LevelId | null) {
    const key = String(id)
    if (level === null) delete state.answers[key]
    else state.answers[key] = level
    if (level !== 'acquis') {
      const i = state.strengths.indexOf(id)
      if (i !== -1) state.strengths.splice(i, 1)
    }
    touch()
  }

  /** Un toucher : marque « Je sais déjà », ou retire la marque si l'élément en a déjà une. */
  function toggle(id: number): LevelId | null {
    const next = levelOf(id) ? null : 'acquis'
    setLevel(id, next)
    return next
  }

  function markThemeSeen(themeId: string) {
    if (state.seenThemes.includes(themeId)) return
    state.seenThemes.push(themeId)
    touch()
  }

  function setPosition(position: Position) {
    state.position = position
    touch()
  }

  function setName(name: string) {
    state.name = name.slice(0, 60)
    touch()
  }

  function toggleStrength(id: number): boolean {
    const i = state.strengths.indexOf(id)
    if (i !== -1) {
      state.strengths.splice(i, 1)
      touch()
      return true
    }
    if (levelOf(id) !== 'acquis' || state.strengths.length >= MAX_STRENGTHS) return false
    state.strengths.push(id)
    touch()
    return true
  }

  function moveStrength(from: number, to: number) {
    const list = state.strengths
    if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) return
    const [id] = list.splice(from, 1)
    list.splice(to, 0, id)
    touch()
  }

  function setStrengths(ids: number[]) {
    state.strengths = ids.filter((id) => levelOf(id) === 'acquis').slice(0, MAX_STRENGTHS)
    touch()
  }

  function setBilan(index: number, text: string) {
    if (index < 0 || index >= state.bilan.length) return
    state.bilan[index] = text
    touch()
  }

  function reset() {
    Object.assign(state, createInitialState())
    if (timer) clearTimeout(timer)
    timer = null
    dirty = false
    storage.remove(STORAGE_KEY)
  }

  function countTheme(theme: Theme): LevelCounts {
    const c = emptyCounts()
    for (const item of theme.items) {
      const l = state.answers[String(item.id)]
      if (l) {
        c[l] += 1
        c.total += 1
      }
    }
    return c
  }

  function countFamily(family: Family): LevelCounts {
    const c = emptyCounts()
    for (const t of family.themes) {
      const tc = countTheme(t)
      c.acquis += tc.acquis
      c.ameliorer += tc.ameliorer
      c.essayer += tc.essayer
      c.total += tc.total
    }
    return c
  }

  const counts = computed<LevelCounts>(() => {
    const c = emptyCounts()
    for (const l of Object.values(state.answers)) {
      c[l] += 1
      c.total += 1
    }
    return c
  })

  /** Part du catalogue parcourue : thèmes vus sur l'ensemble des thèmes. */
  const progress = computed(() => state.seenThemes.length / totals.themes)

  const started = computed(() => hasProgress(state))

  return {
    state: readonly(state) as Readonly<AppState>,
    levelOf,
    setLevel,
    toggle,
    markThemeSeen,
    setPosition,
    setName,
    toggleStrength,
    moveStrength,
    setStrengths,
    setBilan,
    reset,
    flush,
    countTheme,
    countFamily,
    counts,
    progress,
    started,
  }
}

export type AnswersStore = ReturnType<typeof createAnswersStore>

let instance: AnswersStore | null = null

export function useAnswers(): AnswersStore {
  if (!instance) {
    instance = createAnswersStore()
    if (typeof window !== 'undefined') {
      // Rien ne doit se perdre si l'onglet est fermé pendant le délai d'écriture.
      window.addEventListener('pagehide', () => instance?.flush())
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') instance?.flush()
      })
    }
  }
  return instance
}

export { catalogue }
