import { catalogue, itemIndex, levelById, totals, type Family, type Level, type LevelId, type Theme } from '../data/catalogue'
import type { AppState } from '../store/state'

export interface PdfItem {
  id: number
  label: string
}

export interface PdfLevelGroup {
  level: Level
  items: PdfItem[]
}

export interface PdfTheme {
  theme: Theme
  groups: PdfLevelGroup[]
  total: number
}

export interface PdfFamily {
  family: Family
  counts: Record<LevelId, number>
  total: number
  themes: PdfTheme[]
}

export interface PdfData {
  name: string
  date: Date
  dateLabel: string
  fileName: string
  counts: Record<LevelId, number> & { total: number }
  themesSeen: number
  themesTotal: number
  strengths: (PdfItem & { family: Family; theme: Theme })[]
  bilan: { question: string; answer: string }[]
  families: PdfFamily[]
}

/** « Ama-Grâce Dossou » → « ama-grace-dossou ». */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function isoDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function pdfFileName(name: string, date: Date): string {
  const slug = slugify(name)
  return ['mon-catalogue-des-possibles', slug, isoDate(date)].filter(Boolean).join('-') + '.pdf'
}

/** Rassemble ce qui sera imprimé : seulement les choix de la personne, dans l'ordre du catalogue. */
export function buildPdfData(state: AppState, date = new Date()): PdfData {
  const levels = catalogue.levels
  const counts = { acquis: 0, ameliorer: 0, essayer: 0, total: 0 }

  const families: PdfFamily[] = []
  for (const family of catalogue.families) {
    const fCounts = { acquis: 0, ameliorer: 0, essayer: 0 } as Record<LevelId, number>
    const themes: PdfTheme[] = []
    for (const theme of family.themes) {
      const groups: PdfLevelGroup[] = levels.map((level) => ({ level, items: [] }))
      for (const item of theme.items) {
        const l = state.answers[String(item.id)]
        if (!l) continue
        groups.find((g) => g.level.id === l)!.items.push({ id: item.id, label: item.label })
        fCounts[l] += 1
      }
      const nonEmpty = groups.filter((g) => g.items.length > 0)
      const total = nonEmpty.reduce((n, g) => n + g.items.length, 0)
      if (total > 0) themes.push({ theme, groups: nonEmpty, total })
    }
    const total = fCounts.acquis + fCounts.ameliorer + fCounts.essayer
    for (const l of levels) counts[l.id] += fCounts[l.id]
    counts.total += total
    if (total > 0) families.push({ family, counts: fCounts, total, themes })
  }

  const strengths = state.strengths
    .filter((id) => state.answers[String(id)] === 'acquis' && itemIndex.has(id))
    .slice(0, 10)
    .map((id) => {
      const ref = itemIndex.get(id)!
      return { id, label: ref.item.label, family: ref.family, theme: ref.theme }
    })

  const bilan = catalogue.bilan.slice(1).map((question, i) => ({ question, answer: (state.bilan[i] ?? '').trim() }))

  return {
    name: state.name.trim(),
    date,
    dateLabel: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
    fileName: pdfFileName(state.name, date),
    counts,
    themesSeen: state.seenThemes.length,
    themesTotal: totals.themes,
    strengths,
    bilan,
    families,
  }
}

export { levelById }
