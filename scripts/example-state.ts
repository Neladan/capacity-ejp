/**
 * Réponses FICTIVES, utilisées pour les captures, l'exemple de PDF et les tests.
 * Elles ne correspondent à aucune personne réelle.
 */
import { catalogue } from '../src/data/catalogue'
import type { AppState } from '../src/store/state'

export function exampleState(): AppState {
  const answers: AppState['answers'] = {}
  const seen: string[] = []
  let n = 0
  for (const f of catalogue.families) {
    for (const t of f.themes) {
      seen.push(t.id)
      for (const item of t.items) {
        n++
        const r = (item.id * 37) % 23
        if (r < 6) answers[item.id] = 'acquis'
        else if (r < 8) answers[item.id] = 'ameliorer'
        else if (r < 10) answers[item.id] = 'essayer'
      }
    }
  }
  void n
  const strengths = Object.entries(answers)
    .filter(([, l]) => l === 'acquis')
    .map(([id]) => Number(id))
    .filter((_, i) => i % 23 === 0)
    .slice(0, 10)
  return {
    v: 1,
    name: 'Exemple',
    answers,
    seenThemes: seen.slice(0, 12),
    strengths,
    bilan: [
      '[Exemple] Mes amis disent que je sais écouter et que je garde mon calme.',
      '[Exemple] Parler en public sans stresser, et mieux organiser ma semaine.',
      '[Exemple] Proposer mon aide pour l’atelier de samedi.',
      '[Exemple] Je suis capable d’apprendre, pas à pas.',
    ],
    position: { familyId: catalogue.families[0].id, themeId: catalogue.families[0].themes[0].id },
    updatedAt: Date.UTC(2026, 10, 8),
  }
}
