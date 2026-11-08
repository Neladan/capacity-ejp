import { LEVEL_IDS, itemIndex, themeIndex, type LevelId } from '../data/catalogue'

export const STORAGE_KEY = 'ejp-catalogue-des-possibles'
export const CURRENT_VERSION = 1
export const MAX_STRENGTHS = 10
export const BILAN_FIELDS = 4

export interface Position {
  familyId: string
  themeId: string | null
}

export interface StateV1 {
  v: 1
  name: string
  /** Niveau choisi par élément, clé = numéro d'origine de l'élément. */
  answers: Record<string, LevelId>
  /** Thèmes parcourus jusqu'au bout. */
  seenThemes: string[]
  /** Mes 10 plus belles forces, dans l'ordre choisi. */
  strengths: number[]
  /** Réponses aux rubriques bilan[1..4]. */
  bilan: string[]
  position: Position | null
  updatedAt: number
}

export type AppState = StateV1

export function createInitialState(): AppState {
  return {
    v: 1,
    name: '',
    answers: {},
    seenThemes: [],
    strengths: [],
    bilan: Array(BILAN_FIELDS).fill(''),
    position: null,
    updatedAt: 0,
  }
}

type Migration = (input: any) => any
/** migrations[n] transforme un état de version n en version n + 1. */
const migrations: Record<number, Migration> = {}

/**
 * Transforme n'importe quelle donnée lue sur l'appareil en état valide.
 * Ce qui est inconnu ou abîmé est ignoré, jamais propagé.
 */
export function migrate(input: unknown): AppState {
  if (!input || typeof input !== 'object') return createInitialState()
  let data: any = input
  let version = typeof data.v === 'number' ? data.v : 0
  if (version > CURRENT_VERSION) return createInitialState()
  while (version < CURRENT_VERSION) {
    const step = migrations[version]
    if (!step) return createInitialState()
    data = step(data)
    version += 1
  }
  return sanitize(data)
}

function sanitize(data: any): AppState {
  const state = createInitialState()
  if (typeof data.name === 'string') state.name = data.name.slice(0, 60)

  if (data.answers && typeof data.answers === 'object') {
    for (const [key, level] of Object.entries(data.answers)) {
      if (itemIndex.has(Number(key)) && LEVEL_IDS.includes(level as LevelId)) {
        state.answers[key] = level as LevelId
      }
    }
  }
  if (Array.isArray(data.seenThemes)) {
    state.seenThemes = [...new Set(data.seenThemes.filter((id: unknown) => typeof id === 'string' && themeIndex.has(id)))] as string[]
  }
  if (Array.isArray(data.strengths)) {
    state.strengths = [...new Set(data.strengths as unknown[])]
      .filter((id): id is number => typeof id === 'number' && state.answers[String(id)] === 'acquis')
      .slice(0, MAX_STRENGTHS)
  }
  if (Array.isArray(data.bilan)) {
    state.bilan = state.bilan.map((_, i) => (typeof data.bilan[i] === 'string' ? data.bilan[i] : ''))
  }
  if (data.position && typeof data.position.familyId === 'string') {
    state.position = {
      familyId: data.position.familyId,
      themeId: typeof data.position.themeId === 'string' ? data.position.themeId : null,
    }
  }
  if (typeof data.updatedAt === 'number') state.updatedAt = data.updatedAt
  return state
}

export function parseStored(raw: string | null): AppState {
  if (!raw) return createInitialState()
  try {
    return migrate(JSON.parse(raw))
  } catch {
    return createInitialState()
  }
}

export function hasProgress(state: AppState): boolean {
  return (
    Object.keys(state.answers).length > 0 ||
    state.seenThemes.length > 0 ||
    state.bilan.some((t) => t.trim() !== '')
  )
}
