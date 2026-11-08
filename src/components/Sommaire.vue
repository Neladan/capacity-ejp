<script setup lang="ts">
import { computed } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'
import { catalogue, type Family } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { currentThemeId, goToFamily, goToTheme } from '../composables/useJourney'
import { familyVars } from '../lib/family-style'

const props = defineProps<{ currentFamilyId?: string | null; expandAll?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()
const store = useAnswers()

const seen = computed(() => new Set(store.state.seenThemes))

function isOpen(f: Family) {
  return props.expandAll || f.id === props.currentFamilyId
}

async function onFamily(f: Family) {
  emit('navigate')
  await goToFamily(f.id)
}
async function onTheme(id: string) {
  emit('navigate')
  await goToTheme(id)
}
</script>

<template>
  <nav class="sommaire" aria-label="Sommaire">
    <ol class="families">
      <li v-for="f in catalogue.families" :key="f.id" class="family" :style="familyVars(f)" :data-current="f.id === currentFamilyId">
        <button type="button" class="family-btn" :aria-current="f.id === currentFamilyId ? 'page' : undefined" @click="onFamily(f)">
          <span class="family-num" aria-hidden="true">{{ f.number }}</span>
          <span class="family-title">{{ f.title }}</span>
          <span class="family-count" :aria-label="`${store.countFamily(f).total} choisis`">{{ store.countFamily(f).total }}</span>
        </button>
        <ol v-if="isOpen(f)" class="themes">
          <li v-for="t in f.themes" :key="t.id">
            <button
              type="button"
              class="theme-btn"
              :data-active="t.id === currentThemeId && f.id === currentFamilyId"
              :aria-current="t.id === currentThemeId && f.id === currentFamilyId ? 'location' : undefined"
              @click="onTheme(t.id)"
            >
              <span class="tick" :data-seen="seen.has(t.id)" aria-hidden="true">
                <PhCheck v-if="seen.has(t.id)" :size="11" weight="bold" />
              </span>
              <span class="theme-title">{{ t.title }}</span>
              <span class="theme-count">
                <span class="sr-only">{{ seen.has(t.id) ? 'parcouru, ' : '' }}</span>
                {{ store.countTheme(t).total }}<span class="theme-of">/{{ t.items.length }}</span>
                <span class="sr-only">choisis</span>
              </span>
            </button>
          </li>
        </ol>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.families,
.themes {
  list-style: none;
  margin: 0;
  padding: 0;
}
.family + .family {
  margin-top: 4px;
}
.family-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  border-radius: var(--radius-s);
  text-align: left;
  color: var(--ink);
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.3;
  transition: background-color 160ms ease;
}
.family[data-current='true'] .family-btn {
  background: var(--fam-tint);
}
.family-num {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--fam-accent);
  color: var(--white);
  font-size: 0.85rem;
  font-weight: 700;
}
.family-title {
  flex: 1;
}
.family-count {
  min-width: 28px;
  padding: 0 8px;
  border-radius: var(--radius-pill);
  background: var(--white);
  color: var(--fam-ink);
  font-size: 0.78rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.themes {
  padding: 6px 0 10px 18px;
  margin-left: 13px;
  border-left: 1.5px solid var(--fam-soft);
}
.theme-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 6px 10px;
  border-radius: var(--radius-s);
  text-align: left;
  color: var(--text);
  font-size: 0.86rem;
  line-height: 1.3;
  transition: background-color 160ms ease;
}
.theme-btn[data-active='true'] {
  color: var(--ink);
  font-weight: 600;
  background: var(--white);
  box-shadow: var(--shadow-soft);
}
.tick {
  display: grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--white);
}
.tick[data-seen='true'] {
  background: var(--fam-accent);
  box-shadow: none;
}
.theme-title {
  flex: 1;
}
.theme-count {
  color: var(--fam-ink);
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.theme-of {
  color: var(--muted);
  font-weight: 400;
}
@media (hover: hover) and (pointer: fine) {
  .family-btn:hover,
  .theme-btn:hover {
    background: var(--mist);
  }
  .family[data-current='true'] .family-btn:hover {
    background: var(--fam-tint);
  }
}
</style>
