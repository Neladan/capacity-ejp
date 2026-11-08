import { PhCheck, PhSparkle, PhTrendUp } from '@phosphor-icons/vue'
import type { Component } from 'vue'
import type { LevelId } from '../data/catalogue'

export const levelIcon: Record<LevelId, Component> = {
  acquis: PhCheck,
  ameliorer: PhTrendUp,
  essayer: PhSparkle,
}

export const levelVar: Record<LevelId, string> = {
  acquis: 'var(--lvl-acquis)',
  ameliorer: 'var(--lvl-ameliorer)',
  essayer: 'var(--lvl-essayer)',
}

/** Couleur du trait « entouré à la main ». Le jaune est foncé d'un cran pour rester visible sur fond clair. */
export const levelStroke: Record<LevelId, string> = {
  acquis: '#3c9a5f',
  ameliorer: '#d9a50f',
  essayer: '#f0892a',
}
