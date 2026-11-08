<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion, ReorderGroup, ReorderItem } from 'motion-v'
import { PhArrowDown, PhArrowUp, PhDotsSixVertical, PhDownloadSimple, PhStar, PhX, PhCheck, PhCaretDown } from '@phosphor-icons/vue'
import { allThemes, catalogue, itemIndex, themeIndex } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { MAX_STRENGTHS } from '../store/state'
import { fr, normalize } from '../lib/fr'
import { easeOut, reveal } from '../lib/motion'
import { levelIcon } from '../lib/levels'
import { tick } from '../lib/haptics'
import JourneyLayout from '../components/JourneyLayout.vue'
import AnimatedCount from '../components/AnimatedCount.vue'
import AutoTextarea from '../components/AutoTextarea.vue'

const store = useAnswers()
const counts = store.counts

const familyRows = computed(() => {
  const rows = catalogue.families.map((f) => ({ family: f, counts: store.countFamily(f) }))
  const max = Math.max(1, ...rows.map((r) => r.counts.total))
  return rows.map((r) => ({ ...r, ratio: r.counts.total / max }))
})

const topThemes = computed(() =>
  allThemes
    .map((t) => ({ theme: t, family: themeIndex.get(t.id)!.family, n: store.countTheme(t).acquis }))
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5),
)

/* — Mes 10 plus belles forces — */
const acquisByFamily = computed(() =>
  catalogue.families
    .map((f) => ({
      family: f,
      items: f.themes.flatMap((t) => t.items.filter((i) => store.levelOf(i.id) === 'acquis')),
    }))
    .filter((g) => g.items.length > 0),
)
const acquisTotal = computed(() => counts.value.acquis)
const filter = ref('')
const filteredPool = computed(() => {
  const q = normalize(filter.value.trim())
  if (!q) return acquisByFamily.value
  return acquisByFamily.value
    .map((g) => ({ ...g, items: g.items.filter((i) => normalize(i.label).includes(q)) }))
    .filter((g) => g.items.length > 0)
})
const strengths = computed({
  get: () => [...store.state.strengths],
  set: (ids: number[]) => store.setStrengths(ids),
})
const full = computed(() => store.state.strengths.length >= MAX_STRENGTHS)
const finePointer = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches

function toggleStrength(id: number) {
  if (store.toggleStrength(id)) tick()
}
function move(i: number, dir: -1 | 1) {
  store.moveStrength(i, i + dir)
  tick(5)
  requestAnimationFrame(() => document.getElementById(`force-${store.state.strengths[i + dir]}-${dir < 0 ? 'up' : 'down'}`)?.focus())
}

/* — Rubriques — */
const saved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | undefined
function onBilan(i: number, text: string) {
  store.setBilan(i, text)
  saved.value = true
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.value = false), 1600)
}
</script>

<template>
  <JourneyLayout heading="Mon bilan">
    <div class="bilan">
      <header class="intro">
        <motion.h1 class="h1" :initial="{ opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, ease: easeOut }">
          Mon bilan<template v-if="store.state.name">, {{ store.state.name }}</template>
        </motion.h1>
        <p class="lede intro-sub">{{ fr('Ce que tu as reconnu en toi, et ce que tu as envie d’en faire.') }}</p>
      </header>

      <!-- Synthèse -->
      <section class="section" aria-labelledby="synthese">
        <h2 id="synthese" class="h2">En un coup d’œil</h2>
        <ul class="totals">
          <li v-for="(l, i) in catalogue.levels" :key="l.id" class="total">
            <span class="total-dot" :style="{ background: l.color }"><component :is="levelIcon[l.id]" :size="16" weight="bold" aria-hidden="true" /></span>
            <span class="total-num"><AnimatedCount :value="counts[l.id]" :delay="i * 0.06" /></span>
            <span class="total-label">{{ l.label }}</span>
          </li>
        </ul>

        <div class="split">
          <div class="panel">
            <h3 class="h3">Par famille</h3>
            <ul class="bars">
              <li v-for="(r, i) in familyRows" :key="r.family.id" class="bar-row">
                <div class="bar-head">
                  <span>{{ r.family.title }}</span>
                  <strong>{{ r.counts.total }}</strong>
                </div>
                <div class="bar-track" aria-hidden="true">
                  <motion.span
                    class="bar-fill"
                    :style="{ background: r.family.color.accent }"
                    :initial="{ scaleX: 0 }"
                    :while-in-view="{ scaleX: r.ratio }"
                    :in-view-options="{ once: true }"
                    :transition="{ duration: 0.45, ease: easeOut, delay: i * 0.06 }"
                  />
                </div>
              </li>
            </ul>
          </div>
          <div class="panel">
            <h3 class="h3">Là où tu te reconnais le plus</h3>
            <ol v-if="topThemes.length" class="top">
              <li v-for="t in topThemes" :key="t.theme.id" class="top-row">
                <span class="top-dot" :style="{ background: t.family.color.accent }" aria-hidden="true" />
                <span class="top-title">{{ t.theme.title }}</span>
                <span class="top-n">{{ t.n }} <span class="sr-only">« {{ catalogue.levels[0].label }} »</span></span>
              </li>
            </ol>
            <p v-else class="empty">{{ fr('Marque quelques éléments « Je sais déjà » pour voir apparaître tes thèmes forts.') }}</p>
            <p v-if="topThemes.length" class="note">Nombre de «&#8239;{{ catalogue.levels[0].label }}&#8239;» par thème.</p>
          </div>
        </div>
      </section>

      <!-- Mes 10 plus belles forces -->
      <section class="section" aria-labelledby="forces">
        <div class="forces-head">
          <h2 id="forces" class="h2">{{ catalogue.bilan[0] }}</h2>
          <p class="forces-count" :data-full="full" aria-live="polite">
            <span class="sr-only">Forces choisies :</span>
            <strong>{{ store.state.strengths.length }}</strong>&#8239;/&#8239;{{ MAX_STRENGTHS }}
          </p>
        </div>
        <p class="hint">{{ fr('Choisis-les parmi ce que tu sais déjà. Tu peux ensuite les classer dans l’ordre qui te ressemble.') }}</p>

        <ReorderGroup v-if="strengths.length" v-model:values="strengths" axis="y" as="ol" class="chosen">
          <ReorderItem v-for="(id, i) in strengths" :key="id" :value="id" class="chosen-item" :drag="finePointer ? 'y' : false" as="li">
            <span class="rank" aria-hidden="true">{{ i + 1 }}</span>
            <span class="chosen-label">{{ itemIndex.get(id)?.item.label }}</span>
            <span v-if="finePointer" class="grip" aria-hidden="true"><PhDotsSixVertical :size="20" /></span>
            <span class="moves">
              <button :id="`force-${id}-up`" type="button" class="icon-btn" :disabled="i === 0" :aria-label="`Monter « ${itemIndex.get(id)?.item.label} »`" @click="move(i, -1)">
                <PhArrowUp :size="18" />
              </button>
              <button
                :id="`force-${id}-down`"
                type="button"
                class="icon-btn"
                :disabled="i === strengths.length - 1"
                :aria-label="`Descendre « ${itemIndex.get(id)?.item.label} »`"
                @click="move(i, 1)"
              >
                <PhArrowDown :size="18" />
              </button>
              <button type="button" class="icon-btn" :aria-label="`Retirer « ${itemIndex.get(id)?.item.label} » de mes forces`" @click="toggleStrength(id)">
                <PhX :size="18" />
              </button>
            </span>
          </ReorderItem>
        </ReorderGroup>

        <div class="pool">
          <div v-if="acquisTotal === 0" class="empty-pool">
            <p>{{ fr('Tu n’as encore rien marqué « Je sais déjà ». Parcours le catalogue, puis reviens ici.') }}</p>
            <RouterLink :to="{ name: 'family', params: { familyId: store.state.position?.familyId ?? catalogue.families[0].id } }" class="btn btn-primary">
              Parcourir le catalogue
            </RouterLink>
          </div>
          <template v-else>
            <p class="pool-intro">Tes «&#8239;{{ catalogue.levels[0].label }}&#8239;», par famille&#8239;:</p>
            <input v-if="acquisTotal > 12" v-model="filter" type="search" class="filter" placeholder="Filtrer mes « Je sais déjà »" aria-label="Filtrer mes éléments « Je sais déjà »" />
            <p v-if="full" class="full-note" role="status">{{ fr('Tu as choisi tes 10 forces. Retire-en une pour en choisir une autre.') }}</p>
            <details
              v-for="g in filteredPool"
              :key="g.family.id + (filter ? '-f' : '')"
              class="pool-group"
              :open="!!filter || filteredPool.length === 1"
            >
              <summary class="pool-title">
                <span class="top-dot" :style="{ background: g.family.color.accent }" aria-hidden="true" />
                <span class="pool-name">{{ g.family.title }}</span>
                <span class="pool-n">{{ g.items.length }}</span>
                <PhCaretDown :size="16" class="caret" aria-hidden="true" />
              </summary>
              <ul class="chips">
                <li v-for="item in g.items" :key="item.id">
                  <button
                    type="button"
                    class="chip"
                    :aria-pressed="store.state.strengths.includes(item.id)"
                    :disabled="full && !store.state.strengths.includes(item.id)"
                    @click="toggleStrength(item.id)"
                  >
                    <PhCheck v-if="store.state.strengths.includes(item.id)" :size="14" weight="bold" aria-hidden="true" />
                    <PhStar v-else :size="14" aria-hidden="true" />
                    {{ item.label }}
                  </button>
                </li>
              </ul>
            </details>
          </template>
        </div>
      </section>

      <!-- Les 4 autres rubriques -->
      <section class="section" aria-labelledby="rubriques">
        <h2 id="rubriques" class="sr-only">Les autres rubriques de mon bilan</h2>
        <div class="fields">
          <motion.div v-for="(q, i) in catalogue.bilan.slice(1)" :key="q" v-bind="reveal">
            <AutoTextarea :id="`bilan-${i + 1}`" :label="q" :model-value="store.state.bilan[i]" @update:model-value="(v) => onBilan(i, v)" />
          </motion.div>
        </div>
        <p class="saved" role="status" :data-on="saved">
          <PhCheck :size="14" weight="bold" aria-hidden="true" />
          <span>{{ saved ? 'Enregistré sur cet appareil' : '' }}</span>
        </p>
      </section>

      <section class="finish on-deep">
        <p class="lede finish-text">{{ fr('Ton bilan est prêt quand tu veux : tu peux le télécharger et le garder.') }}</p>
        <RouterLink to="/export" class="btn btn-light"><PhDownloadSimple :size="18" aria-hidden="true" /> Télécharger mon PDF</RouterLink>
      </section>
    </div>
  </JourneyLayout>
</template>

<style scoped>
.bilan {
  max-width: 880px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 64px) var(--gutter) 64px;
}
.h1 {
  color: var(--deep);
  font-size: var(--step-4);
  letter-spacing: -0.035em;
}
.intro-sub {
  margin-top: 12px;
  font-size: var(--step-1);
  color: var(--text);
}
.section {
  margin-top: clamp(40px, 7vw, 72px);
}
.h2 {
  color: var(--deep);
  font-size: var(--step-2);
}
.h3 {
  color: var(--ink);
  font-size: 1rem;
  margin-bottom: 16px;
}
.totals {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.total {
  display: grid;
  gap: 4px;
  padding: 16px;
  border-radius: var(--radius-m);
  background: var(--white);
  box-shadow: var(--shadow-soft);
}
.total-dot {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--on-level);
  margin-bottom: 6px;
}
.total-num {
  color: var(--ink);
  font-size: var(--step-3);
  font-weight: 700;
  line-height: 1;
}
.total-label {
  font-size: 0.82rem;
  line-height: 1.3;
}
.split {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}
@media (min-width: 760px) {
  .split {
    grid-template-columns: 1fr 1fr;
  }
}
.panel {
  padding: 20px;
  border-radius: var(--radius-l);
  background: var(--white);
  box-shadow: var(--shadow-soft);
}
.bars,
.top,
.chips {
  list-style: none;
  margin: 0;
  padding: 0;
}
.bar-row + .bar-row {
  margin-top: 14px;
}
.bar-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.85rem;
  line-height: 1.3;
  margin-bottom: 6px;
}
.bar-head strong {
  color: var(--ink);
}
.bar-track {
  height: 10px;
  border-radius: 5px;
  background: var(--mist);
  overflow: hidden;
}
.bar-fill {
  display: block;
  height: 100%;
  border-radius: 5px;
  transform-origin: left;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 0.9rem;
}
.top-row:last-child {
  border-bottom: 0;
}
.top-dot {
  display: inline-block;
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.top-title {
  flex: 1;
  color: var(--ink);
}
.top-n {
  font-weight: 700;
  color: var(--ink);
}
.note,
.empty {
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.8rem;
}

.forces-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.forces-count {
  flex: none;
  padding: 4px 14px;
  border-radius: var(--radius-pill);
  background: var(--mist);
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.forces-count strong {
  color: var(--ink);
  font-size: 1.1rem;
}
.forces-count[data-full='true'] {
  background: var(--lvl-acquis);
  color: var(--on-level);
}
.hint {
  margin-top: 8px;
  max-width: 60ch;
}
.chosen {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.chosen-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 8px 6px 8px 10px;
  border-radius: var(--radius-m);
  background: var(--white);
  box-shadow: var(--shadow-soft);
  user-select: none;
}
.rank {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--deep);
  color: var(--white);
  font-weight: 700;
  font-size: 0.9rem;
}
.chosen-label {
  flex: 1;
  color: var(--ink);
  font-weight: 600;
  line-height: 1.3;
}
.grip {
  color: var(--muted);
  cursor: grab;
}
.moves {
  display: flex;
}
.moves .icon-btn[disabled] {
  opacity: 0.3;
  pointer-events: none;
}
.pool {
  margin-top: 24px;
  padding: 20px;
  border-radius: var(--radius-l);
  background: var(--mist);
}
.empty-pool {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.filter {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--white);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  margin-bottom: 8px;
}
.full-note {
  margin: 8px 0;
  color: var(--ink);
  font-weight: 600;
  font-size: 0.88rem;
}
.pool-intro {
  margin-bottom: 10px;
  color: var(--ink);
  font-weight: 600;
  font-size: 0.9rem;
}
.pool-group {
  border-radius: var(--radius-m);
  background: rgb(255 255 255 / 0.55);
}
.pool-group + .pool-group {
  margin-top: 8px;
}
.pool-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 14px;
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}
.pool-title::-webkit-details-marker {
  display: none;
}
.pool-name {
  flex: 1;
}
.pool-n {
  padding: 0 8px;
  border-radius: var(--radius-pill);
  background: var(--white);
  font-size: 0.78rem;
}
.caret {
  transition: transform 200ms var(--ease-out);
}
details[open] .caret {
  transform: rotate(180deg);
}
details .chips {
  padding: 0 14px 14px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-pill);
  background: var(--white);
  color: var(--ink);
  font-size: 0.86rem;
  line-height: 1.3;
  text-align: left;
  transition:
    transform 160ms var(--ease-out),
    background-color 160ms ease;
}
.chip:active {
  transform: scale(0.97);
}
.chip[aria-pressed='true'] {
  background: var(--lvl-acquis);
  color: var(--on-level);
  font-weight: 600;
}
.chip[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}
.fields {
  display: grid;
  gap: 32px;
}
.saved {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  margin-top: 12px;
  color: var(--ejp);
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 200ms ease;
}
.saved[data-on='true'] {
  opacity: 1;
}
.finish {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 56px;
  padding: clamp(24px, 5vw, 40px);
  border-radius: var(--radius-l);
  background: var(--deep);
}
.finish-text {
  color: var(--white);
  font-size: var(--step-1);
  max-width: 30ch;
}
</style>
