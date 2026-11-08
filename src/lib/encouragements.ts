/** Formules de fin de thème : sobres, sans flatterie ni contenu religieux. */
const withChoices = [
  'Un thème de plus. Ce que tu viens de reconnaître compte vraiment.',
  'Prends un instant : qu’est-ce qui t’a surpris·e dans ce thème ?',
  'Tu avances à ton rythme, et c’est très bien ainsi.',
  'Chaque élément reconnu dit quelque chose de vrai sur toi.',
  'Tu pourras revenir sur ce thème quand tu voudras.',
  'Ce que tu fais « à moitié » aujourd’hui peut grandir avec le temps.',
  'Garde en tête ce qui t’a fait sourire en lisant.',
]

const withoutChoices = [
  'Rien de coché ici ? Ce n’est pas grave : cela aussi t’apprend quelque chose.',
  'Ce thème ne te parle pas encore. Les suivants te parleront peut-être davantage.',
]

export function encouragement(themeIndex: number, chosen: number): string {
  const list = chosen > 0 ? withChoices : withoutChoices
  return list[themeIndex % list.length]
}
