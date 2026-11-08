import raw from '../../data/catalogue.json'

export type LevelId = 'acquis' | 'ameliorer' | 'essayer'

export interface Level {
  id: LevelId
  label: string
  hint: string
  color: string
}

export interface Item {
  id: number
  label: string
}

export interface Theme {
  id: string
  title: string
  items: Item[]
}

export interface FamilyColor {
  accent: string
  tint: string
  soft: string
}

export interface Family {
  id: string
  number: number
  title: string
  description: string
  color: FamilyColor
  themes: Theme[]
}

export interface Catalogue {
  title: string
  subtitle: string
  intro: { why: string[]; how: string[]; keep: string }
  levels: Level[]
  bilan: string[]
  families: Family[]
}

export const catalogue = raw as Catalogue

export const LEVEL_IDS: LevelId[] = catalogue.levels.map((l) => l.id)

export const levelById = Object.fromEntries(catalogue.levels.map((l) => [l.id, l])) as Record<LevelId, Level>

export interface ItemRef {
  item: Item
  theme: Theme
  family: Family
}

/** Index de chaque élément vers son thème et sa famille. */
export const itemIndex = new Map<number, ItemRef>()
/** Index de chaque thème vers sa famille. */
export const themeIndex = new Map<string, { theme: Theme; family: Family }>()

for (const family of catalogue.families) {
  for (const theme of family.themes) {
    themeIndex.set(theme.id, { theme, family })
    for (const item of theme.items) itemIndex.set(item.id, { item, theme, family })
  }
}

export const allThemes: Theme[] = catalogue.families.flatMap((f) => f.themes)

export const totals = {
  families: catalogue.families.length,
  themes: allThemes.length,
  items: itemIndex.size,
}

export function familyItemCount(family: Family): number {
  return family.themes.reduce((n, t) => n + t.items.length, 0)
}

export function familyById(id: string): Family | undefined {
  return catalogue.families.find((f) => f.id === id)
}
