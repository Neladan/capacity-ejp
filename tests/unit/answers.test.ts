import { describe, expect, it } from 'vitest'
import { createAnswersStore } from '../../src/store/answers'
import { STORAGE_KEY, migrate, parseStored } from '../../src/store/state'
import type { SafeStorage } from '../../src/lib/storage'
import { catalogue } from '../../src/data/catalogue'

function memoryStorage(initial: Record<string, string> = {}): SafeStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    get: (k) => data[k] ?? null,
    set: (k, v) => ((data[k] = v), true),
    remove: (k) => void delete data[k],
  }
}

function brokenStorage(): SafeStorage {
  return { get: () => null, set: () => false, remove: () => {} }
}

const firstTheme = catalogue.families[0].themes[0]

describe('store des réponses', () => {
  it('marque « Je sais déjà » au premier toucher et retire la marque au second', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    expect(s.toggle(1)).toBe('acquis')
    expect(s.levelOf(1)).toBe('acquis')
    expect(s.toggle(1)).toBeNull()
    expect(s.levelOf(1)).toBeNull()
  })

  it('un toucher sur un élément « À améliorer » retire la marque', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    s.setLevel(2, 'ameliorer')
    expect(s.toggle(2)).toBeNull()
  })

  it('compte les réponses par niveau, par thème et par famille', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    s.setLevel(1, 'acquis')
    s.setLevel(2, 'ameliorer')
    s.setLevel(3, 'essayer')
    s.setLevel(1060, 'acquis')
    expect(s.counts.value).toEqual({ acquis: 2, ameliorer: 1, essayer: 1, total: 4 })
    expect(s.countTheme(firstTheme)).toEqual({ acquis: 1, ameliorer: 1, essayer: 1, total: 3 })
    expect(s.countFamily(catalogue.families[3]).total).toBe(1)
  })

  it('sauvegarde et recharge sans perte', () => {
    const storage = memoryStorage()
    const a = createAnswersStore({ storage, debounce: 0 })
    a.setName('Ama')
    a.setLevel(10, 'essayer')
    a.setLevel(11, 'acquis')
    a.toggleStrength(11)
    a.setBilan(0, 'Mes amis disent que j’écoute bien.')
    a.markThemeSeen(firstTheme.id)
    const b = createAnswersStore({ storage, debounce: 0 })
    expect(b.state.name).toBe('Ama')
    expect(b.levelOf(10)).toBe('essayer')
    expect(b.state.strengths).toEqual([11])
    expect(b.state.bilan[0]).toBe('Mes amis disent que j’écoute bien.')
    expect(b.progress.value).toBeCloseTo(1 / 34)
  })

  it('regroupe les écritures et les force avec flush()', () => {
    const storage = memoryStorage()
    const s = createAnswersStore({ storage, debounce: 10_000 })
    s.toggle(5)
    expect(storage.data[STORAGE_KEY]).toBeUndefined()
    s.flush()
    expect(JSON.parse(storage.data[STORAGE_KEY]).answers).toEqual({ '5': 'acquis' })
  })

  it('n’écrase pas l’appareil quand rien n’a changé', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ v: 1, answers: { '9': 'acquis' } }) })
    const s = createAnswersStore({ storage, debounce: 10_000 })
    storage.data[STORAGE_KEY] = JSON.stringify({ v: 1, answers: { '9': 'essayer' } })
    s.flush()
    expect(JSON.parse(storage.data[STORAGE_KEY]).answers).toEqual({ '9': 'essayer' })
  })

  it('continue de fonctionner quand le stockage est indisponible', () => {
    const s = createAnswersStore({ storage: brokenStorage(), debounce: 0 })
    expect(() => s.toggle(1)).not.toThrow()
    expect(s.levelOf(1)).toBe('acquis')
  })

  it('limite les forces à 10 éléments « Je sais déjà »', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    s.setLevel(500, 'ameliorer')
    expect(s.toggleStrength(500)).toBe(false)
    for (let id = 1; id <= 11; id++) s.setLevel(id, 'acquis')
    for (let id = 1; id <= 10; id++) expect(s.toggleStrength(id)).toBe(true)
    expect(s.toggleStrength(11)).toBe(false)
    expect(s.state.strengths).toHaveLength(10)
  })

  it('retire une force quand son niveau change', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    s.setLevel(7, 'acquis')
    s.toggleStrength(7)
    s.setLevel(7, 'essayer')
    expect(s.state.strengths).toEqual([])
  })

  it('réordonne les forces', () => {
    const s = createAnswersStore({ storage: memoryStorage(), debounce: 0 })
    ;[1, 2, 3].forEach((id) => {
      s.setLevel(id, 'acquis')
      s.toggleStrength(id)
    })
    s.moveStrength(2, 0)
    expect(s.state.strengths).toEqual([3, 1, 2])
    s.moveStrength(0, 5)
    expect(s.state.strengths).toEqual([3, 1, 2])
  })

  it('recommencer efface tout, y compris sur l’appareil', () => {
    const storage = memoryStorage()
    const s = createAnswersStore({ storage, debounce: 0 })
    s.toggle(1)
    s.reset()
    expect(s.counts.value.total).toBe(0)
    expect(storage.data[STORAGE_KEY]).toBeUndefined()
    expect(s.started.value).toBe(false)
  })
})

describe('état versionné', () => {
  it('ignore un JSON abîmé', () => {
    expect(parseStored('{oups').answers).toEqual({})
  })

  it('écarte les éléments inconnus, niveaux invalides et forces incohérentes', () => {
    const state = migrate({
      v: 1,
      answers: { '1': 'acquis', '2': 'violet', '99999': 'acquis', '3': 'essayer' },
      strengths: [1, 3, 1],
      seenThemes: [firstTheme.id, 'inconnu'],
      bilan: ['a', 42],
    })
    expect(state.answers).toEqual({ '1': 'acquis', '3': 'essayer' })
    expect(state.strengths).toEqual([1])
    expect(state.seenThemes).toEqual([firstTheme.id])
    expect(state.bilan).toEqual(['a', '', '', ''])
  })

  it('n’écrase pas avec une version future inconnue', () => {
    expect(migrate({ v: 99, name: 'X' }).name).toBe('')
  })
})
