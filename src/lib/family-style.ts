import type { Family } from '../data/catalogue'

/** Assombrit une couleur hex, pour obtenir un texte lisible (≥ 4,5:1) sur la teinte de fond. */
export function darken(hex: string, k = 0.82): string {
  const h = hex.replace('#', '')
  return (
    '#' +
    [0, 2, 4]
      .map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0'))
      .join('')
  )
}

export function familyVars(family: Family): Record<string, string> {
  return {
    '--fam-accent': family.color.accent,
    '--fam-ink': darken(family.color.accent),
    '--fam-tint': family.color.tint,
    '--fam-soft': family.color.soft,
  }
}
