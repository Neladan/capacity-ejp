<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { PhDownloadSimple, PhArrowClockwise, PhFilePdf, PhNotePencil } from '@phosphor-icons/vue'
import { useAnswers } from '../store/answers'
import { fr, formatNumber } from '../lib/fr'
import { easeOut } from '../lib/motion'
import { tick } from '../lib/haptics'
import JourneyLayout from '../components/JourneyLayout.vue'
import type { PdfData } from '../pdf/data'

const store = useAnswers()
const name = ref(store.state.name)
const status = ref<'idle' | 'working' | 'ready' | 'error'>('idle')
const canvas = ref<HTMLCanvasElement>()
const frame = ref<HTMLElement>()
const pages = ref(0)
const data = ref<PdfData | null>(null)
let blob: Blob | null = null
let run = 0

const nothingYet = computed(() => store.counts.value.total === 0 && store.state.bilan.every((b) => !b.trim()))

async function generate() {
  const id = ++run
  status.value = 'working'
  try {
    const [{ generatePdf }, { renderFirstPage }] = await Promise.all([import('../pdf/generate'), import('../pdf/preview')])
    const result = await generatePdf(JSON.parse(JSON.stringify(store.state)))
    if (id !== run) return
    blob = result.blob
    data.value = result.data
    pages.value = await renderFirstPage(result.blob, canvas.value!, frame.value?.clientWidth ?? 360)
    if (id === run) status.value = 'ready'
  } catch (e) {
    console.error(e)
    if (id === run) status.value = 'error'
  }
}

function download() {
  if (!blob || !data.value) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = data.value.fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  tick(12)
}

let nameTimer: ReturnType<typeof setTimeout> | undefined
watch(name, (v) => {
  store.setName(v.trim())
  clearTimeout(nameTimer)
  nameTimer = setTimeout(generate, 600)
})

onMounted(generate)
onBeforeUnmount(() => {
  run++
  clearTimeout(nameTimer)
})
</script>

<template>
  <JourneyLayout heading="Mon PDF">
    <div class="export">
      <header>
        <motion.h1 class="h1" :initial="{ opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, ease: easeOut }">
          Télécharger mon PDF
        </motion.h1>
        <p class="lede sub">{{ fr('Ton catalogue et ton bilan, réunis dans un document à garder, imprimer ou partager.') }}</p>
      </header>

      <div class="layout">
        <div ref="frame" class="preview" :data-status="status">
          <div v-if="status !== 'ready'" class="skeleton" aria-hidden="true">
            <div class="sk-top">
              <span class="sk-line w40" />
              <span class="sk-line w70 big" />
              <span class="sk-line w55 big" />
              <span class="sk-line w60" />
            </div>
            <div class="sk-bottom">
              <span class="sk-dot" v-for="i in 3" :key="i" />
            </div>
          </div>
          <canvas ref="canvas" class="preview-canvas" role="img" :aria-label="`Aperçu de la première page de ton PDF${pages ? `, sur ${pages} pages` : ''}`" />
          <p v-if="status === 'working'" class="working" role="status">
            <span class="spinner" aria-hidden="true" />
            Préparation de ton PDF…
          </p>
        </div>

        <aside class="side">
          <div class="card">
            <label for="prenom-pdf" class="label">Prénom sur le PDF</label>
            <input id="prenom-pdf" v-model="name" class="field" type="text" autocomplete="given-name" maxlength="60" placeholder="Facultatif" />

            <dl v-if="data" class="facts">
              <div><dt>Éléments reconnus</dt><dd>{{ formatNumber(data.counts.total) }}</dd></div>
              <div><dt>Forces choisies</dt><dd>{{ data.strengths.length }}&#8239;/&#8239;10</dd></div>
              <div v-if="pages"><dt>Pages</dt><dd>{{ pages }}</dd></div>
            </dl>
            <p v-if="data" class="file"><PhFilePdf :size="16" aria-hidden="true" /> {{ data.fileName }}</p>

            <button type="button" class="btn btn-primary dl" :disabled="status !== 'ready'" @click="download">
              <PhDownloadSimple :size="18" weight="bold" aria-hidden="true" />
              Télécharger le PDF
            </button>
            <p v-if="status === 'error'" class="error" role="alert">
              {{ fr('La création du PDF a échoué. Vérifie ta connexion lors de la première utilisation, puis réessaie.') }}
              <button type="button" class="btn btn-quiet" @click="generate"><PhArrowClockwise :size="16" aria-hidden="true" /> Réessayer</button>
            </p>
          </div>
          <p v-if="nothingYet" class="nudge">
            {{ fr('Ton PDF est encore presque vide. Tu peux d’abord parcourir le catalogue ou remplir ton bilan.') }}
            <RouterLink to="/bilan" class="btn btn-ghost"><PhNotePencil :size="18" aria-hidden="true" /> Mon bilan</RouterLink>
          </p>
          <p class="privacy">{{ fr('Le PDF est créé sur ton appareil : aucune donnée n’est envoyée.') }}</p>
        </aside>
      </div>
    </div>
  </JourneyLayout>
</template>

<style scoped>
.export {
  max-width: 1040px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 64px) var(--gutter) 64px;
}
.h1 {
  color: var(--deep);
  font-size: var(--step-4);
  letter-spacing: -0.035em;
}
.sub {
  margin-top: 12px;
  font-size: var(--step-1);
  max-width: 44ch;
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  margin-top: 32px;
}
@media (min-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: start;
    gap: 40px;
  }
}
.preview {
  position: relative;
  width: 100%;
  max-width: 460px;
  aspect-ratio: 595 / 842;
  border-radius: 6px;
  overflow: hidden;
  background: var(--white);
  box-shadow: var(--shadow-lift);
}
.preview-canvas {
  display: block;
  max-width: 100%;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 300ms ease;
}
.preview[data-status='ready'] .preview-canvas {
  opacity: 1;
}
.skeleton {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 64% 1fr;
}
.sk-top {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 0 9%;
  background: var(--deep);
}
.sk-bottom {
  display: flex;
  gap: 12%;
  align-items: center;
  padding: 0 9%;
  background: var(--paper);
}
.sk-line {
  height: 8px;
  border-radius: 4px;
  background: var(--deep-2);
  animation: breathe 1.4s ease-in-out infinite alternate;
}
.sk-line.big {
  height: 20px;
}
.w40 {
  width: 40%;
}
.w55 {
  width: 55%;
}
.w60 {
  width: 60%;
}
.w70 {
  width: 70%;
}
.sk-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--mist);
  animation: breathe 1.4s ease-in-out infinite alternate;
}
@keyframes breathe {
  to {
    opacity: 0.45;
  }
}
.working {
  position: absolute;
  left: 50%;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--white);
  box-shadow: var(--shadow-soft);
  color: var(--ink);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transform: translateX(-50%);
}
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--rule);
  border-top-color: var(--ejp);
  animation: spin 650ms linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.side {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}
/* Sur téléphone, l'action d'abord ; l'aperçu juste en dessous. */
@media (max-width: 899px) {
  .side {
    order: -1;
  }
  .preview {
    margin: 0 auto;
  }
}
.card {
  display: grid;
  gap: 12px;
  padding: 24px;
  border-radius: var(--radius-l);
  background: var(--white);
  box-shadow: var(--shadow-soft);
}
.label {
  color: var(--ink);
  font-weight: 600;
}
.field {
  min-height: 52px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--paper);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--ink);
}
.field:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--ejp);
}
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin: 8px 0 0;
}
.facts dt {
  font-size: 0.78rem;
  color: var(--muted);
}
.facts dd {
  margin: 0;
  color: var(--ink);
  font-weight: 700;
  font-size: 1.2rem;
}
.file {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 0.78rem;
  word-break: break-all;
}
.dl {
  margin-top: 4px;
  min-height: 56px;
}
.error {
  color: #853824;
  font-size: 0.88rem;
}
.nudge {
  display: grid;
  gap: 12px;
  justify-items: start;
  padding: 20px;
  border-radius: var(--radius-l);
  background: var(--mist);
  font-size: 0.92rem;
}
.privacy {
  color: var(--muted);
  font-size: 0.8rem;
}
@media (prefers-reduced-motion: reduce) {
  .sk-line,
  .sk-dot {
    animation: none;
  }
  .spinner {
    animation-duration: 1.6s;
  }
}
</style>
