<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import { levelById, totals } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { searchCatalogue } from '../lib/search'
import { fr, formatNumber } from '../lib/fr'
import { levelIcon, levelVar } from '../lib/levels'
import { goToItem, searchOpen } from '../composables/useJourney'
import { useFocusTrap } from '../composables/useFocusTrap'

const store = useAnswers()
const query = ref('')
const panel = ref<HTMLElement>()
const result = computed(() => searchCatalogue(query.value))

function close() {
  searchOpen.value = false
}
useFocusTrap(searchOpen, panel, close)
watch(searchOpen, (o) => o && (query.value = ''))

async function pick(id: number) {
  close()
  await goToItem(id)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div v-if="searchOpen" class="search-root">
        <div class="overlay" aria-hidden="true" @click="close" />
        <div ref="panel" class="panel" role="dialog" aria-modal="true" aria-label="Rechercher dans le catalogue">
          <div class="field">
            <PhMagnifyingGlass :size="20" class="field-icon" aria-hidden="true" />
            <input
              v-model="query"
              data-autofocus
              type="search"
              class="input"
              placeholder="Chercher une capacité, une qualité…"
              :aria-label="`Chercher dans les ${formatNumber(totals.items)} éléments`"
              aria-controls="search-results"
              enterkeyhint="search"
              autocomplete="off"
            />
            <button type="button" class="icon-btn" aria-label="Fermer la recherche" @click="close"><PhX :size="20" /></button>
          </div>
          <p class="status" role="status" aria-live="polite">
            <template v-if="query.trim()">
              {{ result.total === 0 ? 'Aucun élément trouvé.' : `${formatNumber(result.total)} élément${result.total > 1 ? 's' : ''}` }}
              <template v-if="result.total > result.hits.length"> · les {{ result.hits.length }} premiers</template>
            </template>
            <template v-else>{{ fr('Tape un mot, par exemple « écouter » ou « cuisiner », ou un numéro.') }}</template>
          </p>
          <ul id="search-results" class="results">
            <li v-for="h in result.hits" :key="h.item.id">
              <button type="button" class="hit" @click="pick(h.item.id)">
                <span class="hit-label">{{ h.item.label }}</span>
                <span class="hit-where">
                  <span class="dot" :style="{ background: h.family.color.accent }" aria-hidden="true" />
                  <span>{{ h.family.title }} · {{ h.theme.title }} · n<sup>o</sup>&nbsp;{{ h.item.id }}</span>
                </span>
                <span v-if="store.levelOf(h.item.id)" class="chip" :style="{ background: levelVar[store.levelOf(h.item.id)!] }">
                  <component :is="levelIcon[store.levelOf(h.item.id)!]" :size="12" weight="bold" aria-hidden="true" />
                  {{ levelById[store.levelOf(h.item.id)!].label }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-root {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgb(16 59 51 / 0.42);
  transition: opacity 200ms ease;
}
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100svh;
  background: var(--paper);
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}
@media (min-width: 720px) {
  .search-root {
    padding-top: 10vh;
  }
  .panel {
    width: min(640px, calc(100% - 48px));
    height: auto;
    max-height: 72vh;
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-lift);
  }
}
.field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 8px 10px 16px;
  border-bottom: 1px solid var(--rule);
}
.field-icon {
  color: var(--muted);
  flex: none;
}
.input {
  flex: 1;
  min-width: 0;
  min-height: 48px;
  border: 0;
  background: none;
  color: var(--ink);
  font-size: 1.05rem;
}
.input:focus {
  outline: none;
}
.input::placeholder {
  color: var(--muted);
}
.status {
  padding: 12px 20px 4px;
  color: var(--muted);
  font-size: var(--step--1);
}
.results {
  list-style: none;
  margin: 0;
  padding: 4px 8px 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.hit {
  display: grid;
  gap: 2px;
  justify-items: start;
  width: 100%;
  min-height: 56px;
  padding: 10px 12px;
  border-radius: var(--radius-m);
  text-align: left;
}
.hit:focus-visible {
  outline-offset: -2px;
}
.hit-label {
  color: var(--ink);
  font-weight: 600;
}
.hit-where {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: var(--muted);
  font-size: 0.78rem;
}
.hit-where sup {
  font-size: 0.7em;
}
.dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateY(-1px);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: var(--radius-pill);
  color: var(--on-level);
  font-size: 0.72rem;
  font-weight: 600;
}
@media (hover: hover) and (pointer: fine) {
  .hit:hover {
    background: var(--white);
  }
}
.search-enter-from .overlay,
.search-leave-to .overlay,
.search-enter-from .panel,
.search-leave-to .panel {
  opacity: 0;
}
.search-enter-from .panel {
  transform: translateY(8px) scale(0.98);
}
.search-enter-active,
.search-leave-active {
  transition: opacity 200ms;
}
.search-leave-active .panel,
.search-leave-active .overlay {
  transition-duration: 150ms;
}
@media (prefers-reduced-motion: reduce) {
  .search-enter-from .panel {
    transform: none;
  }
}
</style>
