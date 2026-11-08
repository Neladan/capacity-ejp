<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { PhDotsThree, PhX } from '@phosphor-icons/vue'
import { catalogue, levelById, type Item, type LevelId } from '../data/catalogue'
import { levelIcon, levelVar } from '../lib/levels'
import LevelMark from './LevelMark.vue'

const props = defineProps<{
  item: Item
  level: LevelId | null
  open?: boolean
  highlight?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  setLevel: [level: LevelId | null]
  'update:open': [open: boolean]
}>()

const panelId = computed(() => `niveau-${props.item.id}`)
const levelLabel = computed(() => (props.level ? levelById[props.level].label : null))
const radios = ref<HTMLButtonElement[]>([])
/** Le cercle ne se dessine que sur une action de la personne, pas au premier affichage. */
const touched = ref(false)

function onToggle() {
  touched.value = true
  emit('toggle')
}

function choose(level: LevelId | null) {
  touched.value = true
  emit('setLevel', level)
  emit('update:open', false)
}

async function openPanel() {
  const next = !props.open
  emit('update:open', next)
  if (next) {
    await nextTick()
    const i = Math.max(0, catalogue.levels.findIndex((l) => l.id === props.level))
    radios.value[i]?.focus()
  }
}

function onRadioKey(e: KeyboardEvent, index: number) {
  const n = catalogue.levels.length
  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % n
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + n) % n
  if (e.key === 'Escape') {
    emit('update:open', false)
    return
  }
  if (next >= 0) {
    e.preventDefault()
    radios.value[next]?.focus()
  }
}
</script>

<template>
  <li class="row" :id="`element-${item.id}`" :data-level="level ?? 'none'" :class="{ open, highlight }">
    <div class="line">
      <button
        type="button"
        class="main"
        role="checkbox"
        :aria-checked="level ? 'true' : 'false'"
        :aria-label="`${item.label}${levelLabel ? `, ${levelLabel}` : ''}`"
        :aria-describedby="`num-${item.id}`"
        @click="onToggle"
      >
        <LevelMark :level="level" :seed="item.id" :animate="touched" />
        <span class="text">
          <span class="label">{{ item.label }}</span>
          <span class="meta">
            <span :id="`num-${item.id}`" class="num">n<sup>o</sup>&nbsp;{{ item.id }}</span>
            <span v-if="level" class="chip" :style="{ background: levelVar[level] }">
              <component :is="levelIcon[level]" :size="12" weight="bold" aria-hidden="true" />
              {{ levelLabel }}
            </span>
          </span>
        </span>
      </button>
      <button
        type="button"
        class="more icon-btn"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="panelId"
        :aria-label="`Choisir le niveau pour « ${item.label} »`"
        @click="openPanel"
      >
        <PhX v-if="open" :size="18" weight="bold" />
        <PhDotsThree v-else :size="22" weight="bold" />
      </button>
    </div>

    <div v-if="open" :id="panelId" class="panel">
      <div role="radiogroup" :aria-label="`Niveau pour « ${item.label} »`" class="segmented">
        <button
          v-for="(l, i) in catalogue.levels"
          :key="l.id"
          :ref="(el) => (radios[i] = el as HTMLButtonElement)"
          type="button"
          role="radio"
          class="seg"
          :data-level="l.id"
          :aria-checked="level === l.id ? 'true' : 'false'"
          :tabindex="(level ? level === l.id : i === 0) ? 0 : -1"
          @click="choose(l.id)"
          @keydown="onRadioKey($event, i)"
        >
          <span class="seg-dot" :style="{ background: l.color }">
            <component :is="levelIcon[l.id]" :size="12" weight="bold" aria-hidden="true" />
          </span>
          {{ l.label }}
        </button>
      </div>
      <button v-if="level" type="button" class="remove" @click="choose(null)">Retirer la marque</button>
    </div>
  </li>
</template>

<style scoped>
.row {
  list-style: none;
  border-radius: var(--radius-m);
  transition: background-color 200ms ease;
}
.row + .row {
  margin-top: 2px;
}
.row:not([data-level='none']) {
  background: var(--white);
}
.row.open {
  background: var(--white);
  box-shadow: var(--shadow-soft);
}
.row.highlight {
  animation: flash 1.6s var(--ease-out);
}
@keyframes flash {
  0%,
  30% {
    box-shadow: 0 0 0 3px var(--fam-accent);
  }
}
.line {
  display: flex;
  align-items: center;
  gap: 4px;
}
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 6px 4px 6px 4px;
  text-align: left;
  border-radius: var(--radius-m);
  transition: transform 160ms var(--ease-out);
}
.main:active {
  transform: scale(0.985);
}
.text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 4px 0;
}
.label {
  color: var(--ink);
  font-size: var(--step-0);
  line-height: 1.35;
}
.row:not([data-level='none']) .label {
  font-weight: 600;
}
.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.num {
  color: var(--muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}
.num sup {
  font-size: 0.7em;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: var(--radius-pill);
  color: var(--on-level);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.6;
  animation: chip-in 220ms var(--ease-out);
}
@keyframes chip-in {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
}
.more {
  color: var(--muted);
  flex: none;
}
.panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 2px 8px 12px 54px;
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
  @starting-style {
    opacity: 0;
    transform: translateY(-6px);
  }
}
.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.seg {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px 0 8px;
  border-radius: var(--radius-pill);
  background: var(--paper);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--ink);
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    transform 160ms var(--ease-out),
    box-shadow 160ms ease,
    background-color 160ms ease;
}
.seg:active {
  transform: scale(0.97);
}
.seg[aria-checked='true'] {
  background: var(--white);
  box-shadow: inset 0 0 0 2px var(--ink);
}
.seg-dot {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--on-level);
}
.remove {
  min-height: 44px;
  padding: 0 10px;
  color: var(--muted);
  font-size: 0.85rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}
@media (hover: hover) and (pointer: fine) {
  .main:hover .dot,
  .main:hover :deep(.dot) {
    box-shadow: inset 0 0 0 1.5px var(--fam-accent);
  }
  .row[data-level='none']:hover {
    background: rgb(255 255 255 / 0.6);
  }
  .seg:hover {
    box-shadow: inset 0 0 0 1.5px var(--muted);
  }
}
@media (prefers-reduced-motion: reduce) {
  .chip {
    animation: none;
  }
  .panel {
    @starting-style {
      transform: none;
    }
  }
}
</style>
