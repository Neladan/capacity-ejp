<script setup lang="ts">
import { motion } from 'motion-v'
import { PhArrowDown } from '@phosphor-icons/vue'
import { familyItemCount, totals, type Family } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { fr, formatNumber } from '../lib/fr'
import { easeOut } from '../lib/motion'
import { goToTheme, scrollToId } from '../composables/useJourney'

const props = defineProps<{ family: Family }>()
const store = useAnswers()
</script>

<template>
  <section class="cover on-deep" :aria-labelledby="`famille-${family.id}`">
    <svg class="cover-arc" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <circle cx="420" cy="380" r="300" class="arc-fill" />
      <path d="M260 600 V420 a160 160 0 0 1 320 0 V600" fill="none" class="arc-line" stroke-width="2" />
    </svg>
    <div class="cover-inner">
      <motion.div
        class="cover-head"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.42, ease: easeOut }"
      >
        <p class="num" aria-hidden="true">{{ String(family.number).padStart(2, '0') }}</p>
        <p class="part">Partie {{ family.number }} sur {{ totals.families }}</p>
        <h1 :id="`famille-${family.id}`" class="title">{{ family.title }}</h1>
        <p class="lede desc">{{ fr(family.description) }}</p>
        <p class="meta">
          <strong>{{ family.themes.length }}</strong> thèmes · <strong>{{ formatNumber(familyItemCount(family)) }}</strong> éléments
        </p>
        <button type="button" class="btn btn-light start" @click="scrollToId(`theme-${family.themes[0].id}`)">
          Commencer cette famille
          <PhArrowDown :size="18" weight="bold" aria-hidden="true" />
        </button>
      </motion.div>
      <motion.div
        class="cover-themes"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.42, ease: easeOut, delay: 0.08 }"
      >
        <p class="themes-label" id="themes-label">Les thèmes</p>
        <ol class="themes" aria-labelledby="themes-label">
          <li v-for="t in props.family.themes" :key="t.id">
            <button type="button" class="theme" @click="goToTheme(t.id)">
              <span>{{ t.title }}</span>
              <span class="pill">
                <template v-if="store.countTheme(t).total">{{ store.countTheme(t).total }}&#8239;/&#8239;</template>{{ t.items.length }}
              </span>
            </button>
          </li>
        </ol>
      </motion.div>
    </div>
  </section>
</template>

<style scoped>
.cover {
  position: relative;
  overflow: hidden;
  background: var(--deep);
  color: var(--mint);
}
.cover-arc {
  position: absolute;
  right: -30%;
  bottom: -35%;
  width: min(130vw, 900px);
  pointer-events: none;
}
.arc-fill {
  fill: var(--fam-accent);
  opacity: 0.22;
}
.arc-line {
  stroke: var(--fam-soft);
  opacity: 0.3;
}
.cover-inner {
  position: relative;
  display: grid;
  gap: 40px;
  max-width: 1080px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 88px) var(--gutter) clamp(40px, 7vw, 72px);
}
@media (min-width: 1180px) {
  .cover-inner {
    grid-template-columns: 1.1fr 1fr;
    align-items: end;
    gap: 56px;
  }
}
.num {
  color: var(--fam-soft);
  font-size: clamp(4.5rem, 3rem + 7vw, 8rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.05em;
}
.part {
  margin-top: 16px;
  font-size: var(--step--1);
  font-weight: 600;
}
.title {
  margin-top: 6px;
  color: var(--white);
  font-size: var(--step-3);
}
.desc {
  margin-top: 14px;
  color: #d6ece0;
  font-size: var(--step-1);
  line-height: 1.5;
  max-width: 40ch;
}
.meta {
  margin-top: 16px;
  font-size: var(--step--1);
}
.meta strong {
  color: var(--white);
  font-size: 1rem;
}
.start {
  margin-top: 24px;
}
.themes-label {
  margin-bottom: 8px;
  font-size: var(--step--1);
  font-weight: 600;
}
.themes {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid rgb(169 217 192 / 0.2);
}
.theme {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 8px 4px;
  border-bottom: 1px solid rgb(169 217 192 / 0.2);
  color: var(--white);
  text-align: left;
  font-size: 0.92rem;
  transition: padding-left 0ms;
}
.pill {
  flex: none;
  padding: 1px 10px;
  border-radius: var(--radius-pill);
  background: var(--mint);
  color: var(--deep);
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
@media (hover: hover) and (pointer: fine) {
  .theme:hover {
    background: rgb(169 217 192 / 0.08);
  }
}
</style>
