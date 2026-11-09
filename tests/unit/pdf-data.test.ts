import { describe, expect, it } from 'vitest'
import { buildPdfData, pdfFileName, slugify } from '../../src/pdf/data'
import { createInitialState } from '../../src/store/state'
import { catalogue } from '../../src/data/catalogue'

const date = new Date(2026, 10, 8)

function stateWith(answers: Record<number, 'acquis' | 'ameliorer' | 'essayer'>) {
  const s = createInitialState()
  for (const [k, v] of Object.entries(answers)) s.answers[k] = v
  return s
}

describe('données du PDF', () => {
  it('nomme le fichier proprement', () => {
    expect(pdfFileName('Ama-Grâce Dossou', date)).toBe('mon-catalogue-des-possibilites-ama-grace-dossou-2026-11-08.pdf')
    expect(pdfFileName('', date)).toBe('mon-catalogue-des-possibilites-2026-11-08.pdf')
    expect(pdfFileName('  Œlie !', date)).toBe('mon-catalogue-des-possibilites-oelie-2026-11-08.pdf')
    expect(slugify('Éléonore')).toBe('eleonore')
  })

  it('n’imprime que les choix, regroupés par famille, thème et niveau', () => {
    const data = buildPdfData(stateWith({ 1: 'acquis', 3: 'essayer', 2: 'acquis', 1060: 'ameliorer' }), date)
    expect(data.counts).toEqual({ acquis: 2, ameliorer: 1, essayer: 1, total: 4 })
    expect(data.families.map((f) => f.family.number)).toEqual([1, 4])
    const theme = data.families[0].themes[0]
    expect(theme.theme.id).toBe(catalogue.families[0].themes[0].id)
    expect(theme.groups.map((g) => [g.level.id, g.items.map((i) => i.id)])).toEqual([
      ['acquis', [1, 2]],
      ['essayer', [3]],
    ])
    expect(data.families[1].themes).toHaveLength(1)
  })

  it('ne garde que des forces valides, dans l’ordre choisi', () => {
    const s = stateWith({ 5: 'acquis', 9: 'acquis', 12: 'essayer' })
    s.strengths = [9, 12, 5]
    const data = buildPdfData(s, date)
    expect(data.strengths.map((x) => x.id)).toEqual([9, 5])
    expect(data.strengths[0].label).toBe(catalogue.families[0].themes[0].items[8].label)
  })

  it('reprend les 4 rubriques du bilan avec leurs questions', () => {
    const s = createInitialState()
    s.bilan = ['  Mon écoute  ', '', 'Un pas', '']
    const data = buildPdfData(s, date)
    expect(data.bilan.map((b) => b.question)).toEqual(catalogue.bilan.slice(1))
    expect(data.bilan[0].answer).toBe('Mon écoute')
    expect(data.dateLabel).toBe('8 novembre 2026')
  })

  it('reste vide sans réponses', () => {
    const data = buildPdfData(createInitialState(), date)
    expect(data.families).toEqual([])
    expect(data.counts.total).toBe(0)
  })
})
