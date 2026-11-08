<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion, useInView } from 'motion-v'
import { PhArrowRight, PhNotePencil } from '@phosphor-icons/vue'
import { catalogue, type Family } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { fr } from '../lib/fr'
import { easeOut } from '../lib/motion'
import { levelIcon } from '../lib/levels'
import { goToFamily } from '../composables/useJourney'
import AnimatedCount from './AnimatedCount.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ family: Family }>()
const store = useAnswers()
const router = useRouter()
const root = ref<HTMLElement>()
const inView = useInView(root, { once: true, margin: '0px 0px -20% 0px' })

const counts = computed(() => store.countFamily(props.family))
const next = computed(() => catalogue.families.find((f) => f.number === props.family.number + 1) ?? null)
</script>

<template>
  <section ref="root" class="recap" aria-labelledby="recap-title">
    <motion.div
      class="card"
      :initial="{ opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :in-view-options="{ once: true }"
      :transition="{ duration: 0.45, ease: easeOut }"
    >
      <p class="eyebrow">Fin de la partie {{ family.number }}</p>
      <h2 id="recap-title" class="title">{{ family.title }}</h2>
      <p class="lede sub">
        {{ counts.total === 0 ? fr('Tu n’as rien marqué dans cette famille. Tu peux y revenir quand tu veux.') : fr('Voici ce que tu as reconnu dans cette famille.') }}
      </p>
      <ul class="levels">
        <li v-for="(l, i) in catalogue.levels" :key="l.id" class="level">
          <span class="level-dot" :style="{ background: l.color }"><component :is="levelIcon[l.id]" :size="16" weight="bold" aria-hidden="true" /></span>
          <span class="level-num">
            <AnimatedCount v-if="inView" :value="counts[l.id]" :delay="i * 0.08" />
            <template v-else>0</template>
          </span>
          <span class="level-label">{{ l.label }}</span>
        </li>
      </ul>
      <div class="actions">
        <button v-if="next" type="button" class="btn btn-primary" @click="goToFamily(next.id)">
          Famille suivante&#8239;: {{ next.title }}
          <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
        </button>
        <button v-else type="button" class="btn btn-primary" @click="router.push('/bilan')">
          <PhNotePencil :size="18" aria-hidden="true" />
          Remplir mon bilan
        </button>
        <RouterLink v-if="next" to="/bilan" class="btn btn-quiet">Aller à mon bilan</RouterLink>
      </div>
    </motion.div>
  </section>
</template>

<style scoped>
.recap {
  padding: 32px 0 64px;
}
.card {
  padding: clamp(24px, 5vw, 40px);
  border-radius: var(--radius-l);
  background: var(--fam-tint);
}
.eyebrow {
  color: var(--fam-ink);
  font-size: var(--step--1);
  font-weight: 600;
}
.title {
  margin-top: 4px;
  font-size: var(--step-2);
  color: var(--deep);
}
.sub {
  margin-top: 8px;
  color: var(--text);
  font-size: var(--step-1);
}
.levels {
  list-style: none;
  margin: 28px 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
@media (min-width: 640px) {
  .levels {
    grid-template-columns: repeat(3, 1fr);
  }
}
.level {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: var(--radius-m);
  background: var(--white);
}
.level-dot {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--on-level);
}
.level-num {
  color: var(--ink);
  font-size: var(--step-2);
  font-weight: 700;
  line-height: 1.1;
}
.level-label {
  font-size: 0.85rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
