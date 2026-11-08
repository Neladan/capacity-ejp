<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'
import { PhArrowRight } from '@phosphor-icons/vue'
import { catalogue, totals, type LevelId } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { fr } from '../lib/fr'
import { easeOut, reveal } from '../lib/motion'
import ArcMotif from '../components/ArcMotif.vue'
import AnimatedCount from '../components/AnimatedCount.vue'
import HandCircle from '../components/HandCircle.vue'
import ItemRow from '../components/ItemRow.vue'
import ResetConfirm from '../components/ResetConfirm.vue'
import { levelStroke } from '../lib/levels'
import { tick } from '../lib/haptics'

const router = useRouter()
const store = useAnswers()
const intro = catalogue.intro

const percent = computed(() => Math.round(store.progress.value * 100))
const resumeTarget = computed(() => {
  const p = store.state.position
  const familyId = p?.familyId ?? catalogue.families[0].id
  return { name: 'family', params: { familyId }, hash: p?.themeId ? `#theme-${p.themeId}` : undefined }
})

/** Étapes 2 à 4 du mode d'emploi : les trois niveaux, dans l'ordre du catalogue. */
const stepLevel: (LevelId | null)[] = intro.how.map((_, i) => (i >= 1 && i <= 3 ? catalogue.levels[i - 1].id : null))

const stats = [
  { value: totals.families, label: 'familles' },
  { value: totals.themes, label: 'thèmes' },
  { value: totals.items, label: 'éléments' },
]

/* Démo : un vrai élément du catalogue, non enregistré. */
const demoItem = catalogue.families[0].themes[0].items[0]
const demoLevel = ref<LevelId | null>(null)
const demoOpen = ref(false)
function demoToggle() {
  demoLevel.value = demoLevel.value ? null : 'acquis'
  tick()
}

function start() {
  router.push({ name: 'name' })
}
</script>

<template>
  <main id="contenu" class="home">
    <section class="hero on-deep" aria-labelledby="titre">
      <ArcMotif />
      <div class="hero-inner">
        <motion.img
          src="/logo-white.png"
          alt="Église Jeunes Prodiges Cotonou"
          class="logo"
          width="320"
          height="211"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.4 }"
        />
        <motion.div
          class="hero-text"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.45, ease: easeOut, delay: 0.08 }"
        >
          <p class="kicker">EJP Cotonou, outil de découverte de soi</p>
          <h1 id="titre" class="title">{{ catalogue.title }}</h1>
          <p class="lede subtitle">{{ fr(catalogue.subtitle) }}</p>
        </motion.div>

        <dl class="stats">
          <div v-for="(s, i) in stats" :key="s.label" class="stat">
            <dt class="stat-label">{{ s.label }}</dt>
            <dd class="stat-value"><AnimatedCount :value="s.value" :delay="0.25 + i * 0.08" /></dd>
          </div>
        </dl>

        <motion.div
          class="cta"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, ease: easeOut, delay: 0.35 }"
        >
          <template v-if="store.started.value">
            <RouterLink class="btn btn-light resume" :to="resumeTarget">
              Reprendre là où je me suis arrêté·e
              <span class="pct">{{ percent }}&nbsp;%</span>
            </RouterLink>
            <ResetConfirm tone="deep" />
          </template>
          <button v-else type="button" class="btn btn-light" @click="start">
            Commencer
            <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>

    <section class="block why" aria-labelledby="pourquoi">
      <motion.div class="wrap two" v-bind="reveal">
        <h2 id="pourquoi" class="h2">{{ fr('Pourquoi ce document ?') }}</h2>
        <div class="why-text">
          <p class="lede quote">{{ fr(intro.why[0]) }}</p>
          <p v-for="p in intro.why.slice(1)" :key="p" class="body">{{ fr(p) }}</p>
        </div>
      </motion.div>
    </section>

    <section class="block how" aria-labelledby="comment">
      <div class="wrap">
        <motion.h2 id="comment" class="h2" v-bind="reveal">{{ fr('Comment l’utiliser ?') }}</motion.h2>
        <ol class="steps">
          <motion.li
            v-for="(step, i) in intro.how"
            :key="i"
            class="step"
            v-bind="reveal"
            :transition="{ ...reveal.transition, delay: (i % 3) * 0.05 }"
          >
            <span class="step-num" aria-hidden="true">{{ i + 1 }}</span>
            <p class="step-text">{{ fr(step) }}</p>
            <span v-if="stepLevel[i]" class="step-level" aria-hidden="true">
              <span class="step-dot" :style="{ background: catalogue.levels[i - 1].color }" />
              <HandCircle :seed="i * 7" :color="levelStroke[stepLevel[i]!]" :size="44" />
            </span>
          </motion.li>
        </ol>

        <motion.div class="demo" v-bind="reveal">
          <p class="demo-title">Essaie ici, rien n’est enregistré&#8239;:</p>
          <ul class="demo-list">
            <ItemRow v-model:open="demoOpen" :item="demoItem" :level="demoLevel" @toggle="demoToggle" @set-level="(l) => (demoLevel = l)" />
          </ul>
          <p class="demo-hint">Un toucher marque «&#8239;{{ catalogue.levels[0].label }}&#8239;». Les trois points permettent de choisir un autre niveau.</p>
        </motion.div>
      </div>
    </section>

    <section class="block keep on-deep" aria-labelledby="retenir">
      <motion.div class="wrap" v-bind="reveal">
        <h2 id="retenir" class="h2 light">À retenir</h2>
        <p class="lede keep-text">{{ fr(intro.keep) }}</p>
        <button v-if="!store.started.value" type="button" class="btn btn-light" @click="start">
          Commencer
          <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
        </button>
        <RouterLink v-else class="btn btn-light" :to="resumeTarget">Reprendre mon parcours</RouterLink>
      </motion.div>
    </section>

    <footer class="foot">
      <img src="/logo-green.png" alt="" width="96" height="63" />
      <p>{{ fr('Tes réponses restent sur cet appareil : rien n’est envoyé.') }}</p>
    </footer>
  </main>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  background: var(--deep);
  color: var(--mint);
  display: flex;
}
.hero-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: max(28px, env(safe-area-inset-top)) var(--gutter) 48px;
}
.logo {
  width: 104px;
  height: auto;
  align-self: flex-start;
  margin-bottom: auto;
}
.kicker {
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--mint);
  margin-bottom: 14px;
}
.title {
  color: var(--white);
  font-size: var(--step-4);
  line-height: 1;
  letter-spacing: -0.035em;
  max-width: 9ch;
}
@media (min-width: 720px) {
  .title {
    max-width: 13ch;
  }
}
.subtitle {
  margin-top: 20px;
  color: #d6ece0;
  font-size: var(--step-1);
  line-height: 1.5;
  max-width: 34ch;
}
.stats {
  display: flex;
  gap: clamp(24px, 6vw, 56px);
  margin: 0;
  padding-top: 20px;
  border-top: 1px solid rgb(169 217 192 / 0.25);
  width: fit-content;
}
.stat {
  display: flex;
  flex-direction: column-reverse;
}
.stat-value {
  margin: 0;
  color: var(--white);
  font-size: var(--step-3);
  font-weight: 700;
  line-height: 1.1;
}
.stat-label {
  font-size: var(--step--1);
}
.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: auto;
}
.resume .pct {
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--mist);
  color: var(--deep);
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
}

.block {
  padding: clamp(64px, 12vw, 128px) 0;
}
.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}
.two {
  display: grid;
  gap: 24px;
}
@media (min-width: 900px) {
  .two {
    grid-template-columns: 5fr 7fr;
    gap: 64px;
  }
  .why-text {
    border-left: 1px solid var(--rule);
    padding-left: 48px;
  }
}
.h2 {
  font-size: var(--step-3);
  color: var(--deep);
}
.h2.light {
  color: var(--white);
}
.quote {
  color: var(--deep);
  font-size: var(--step-2);
  line-height: 1.35;
  margin-bottom: 20px;
}
.body {
  max-width: 60ch;
}

.how {
  background: var(--white);
}
.steps {
  list-style: none;
  margin: 40px 0 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
@media (min-width: 720px) {
  .steps {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1040px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
}
.step {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-l);
  background: var(--paper);
}
.step-num {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--deep);
  color: var(--white);
  font-weight: 700;
  font-size: 0.9rem;
}
.step-text {
  color: var(--ink);
}
.step-level {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
}
.step-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.step-level :deep(.hand-circle) {
  position: absolute;
  inset: 0;
}

.demo {
  margin-top: 40px;
  padding: 20px;
  border-radius: var(--radius-l);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  max-width: 620px;
}
.demo-title {
  color: var(--ink);
  font-weight: 600;
  margin-bottom: 8px;
}
.demo-list {
  margin: 0;
  padding: 0;
}
.demo-hint {
  margin-top: 8px;
  font-size: var(--step--1);
  color: var(--muted);
}

.keep {
  position: relative;
  background: var(--deep);
  overflow: hidden;
}
.keep .wrap {
  display: grid;
  gap: 24px;
  justify-items: start;
}
.keep-text {
  color: var(--white);
  font-size: var(--step-2);
  line-height: 1.45;
  max-width: 32ch;
}
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px var(--gutter) max(40px, env(safe-area-inset-bottom));
  color: var(--muted);
  font-size: var(--step--1);
}
</style>
