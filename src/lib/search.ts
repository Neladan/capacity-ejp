import { catalogue, type Family, type Item, type Theme } from '../data/catalogue'
import { normalize } from './fr'

export interface SearchHit {
  item: Item
  theme: Theme
  family: Family
}

const index: (SearchHit & { key: string })[] = catalogue.families.flatMap((family) =>
  family.themes.flatMap((theme) => theme.items.map((item) => ({ item, theme, family, key: normalize(item.label) }))),
)

/** Cherche dans les libellés ; tous les mots saisis doivent apparaître. Un numéro trouve l'élément correspondant. */
export function searchCatalogue(query: string, limit = 40): { hits: SearchHit[]; total: number } {
  const q = normalize(query).trim()
  if (!q) return { hits: [], total: 0 }
  if (/^\d+$/.test(q)) {
    const hit = index.find((h) => h.item.id === Number(q))
    return { hits: hit ? [hit] : [], total: hit ? 1 : 0 }
  }
  const words = q.split(/\s+/)
  const matches = index.filter((h) => words.every((w) => h.key.includes(w)))
  // Les libellés qui commencent par la recherche d'abord.
  matches.sort((a, b) => Number(b.key.startsWith(words[0])) - Number(a.key.startsWith(words[0])))
  return { hits: matches.slice(0, limit), total: matches.length }
}
