const NNBSP = ' '

/**
 * Typographie française : espace fine insécable avant ? ! : ; et à l'intérieur des guillemets.
 * Ne change aucun mot, seulement les espaces.
 */
export function fr(text: string): string {
  return text
    .replace(/[   ]*([?!;:])(?=\s|$|»)/g, (m, p: string, offset: number, s: string) => {
      // Ne touche pas aux heures ni aux URL (« 10:30 », « https: »).
      const before = s[offset - 1]
      if (p === ':' && m === ':' && before && /\S/.test(before)) return m
      return NNBSP + p
    })
    .replace(/«[   ]*/g, '«' + NNBSP)
    .replace(/[   ]*»/g, NNBSP + '»')
}

export function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n)}\u00A0${n > 1 ? many : one}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

/** Clé de recherche : minuscules, sans accents, sans « · ». */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[·’']/g, ' ')
}
