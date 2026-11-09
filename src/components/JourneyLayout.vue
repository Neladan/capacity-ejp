<script setup lang="ts">
import { computed } from 'vue'
import { PhListBullets, PhMagnifyingGlass, PhNotePencil, PhDownloadSimple } from '@phosphor-icons/vue'
import { themeIndex, type Family } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { currentThemeId, searchOpen, sheetOpen } from '../composables/useJourney'
import { familyVars } from '../lib/family-style'
import Sommaire from './Sommaire.vue'
import BottomSheet from './BottomSheet.vue'
import SearchDialog from './SearchDialog.vue'
import ResetConfirm from './ResetConfirm.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ family?: Family | null; heading?: string }>()
const store = useAnswers()
const router = useRouter()

const percent = computed(() => Math.round(store.progress.value * 100))
const themeTitle = computed(() => (currentThemeId.value ? themeIndex.get(currentThemeId.value)?.theme.title : null))
const style = computed(() => (props.family ? familyVars(props.family) : undefined))
</script>

<template>
  <div class="journey" :style="style">
    <!-- Desktop : colonne latérale -->
    <aside class="side" aria-label="Navigation du catalogue">
      <div class="side-top">
        <RouterLink to="/" class="side-logo" aria-label="Accueil">
          <img src="/logo-green.png" alt="Église Jeunes Prodiges Cotonou" width="84" height="55" />
        </RouterLink>
        <div class="progress-block">
          <div class="progress-text">
            <span>Parcouru</span><strong>{{ percent }}&nbsp;%</strong>
          </div>
          <div class="track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" aria-label="Part du catalogue parcourue">
            <span class="fill" :style="{ transform: `scaleX(${store.progress.value})` }" />
          </div>
        </div>
        <button type="button" class="search-trigger" @click="searchOpen = true">
          <PhMagnifyingGlass :size="18" aria-hidden="true" />
          Rechercher
        </button>
      </div>
      <div class="side-scroll">
        <Sommaire :current-family-id="family?.id ?? null" />
      </div>
      <div class="side-bottom">
        <RouterLink to="/bilan" class="side-link" active-class="is-active"><PhNotePencil :size="18" aria-hidden="true" /> Mon bilan</RouterLink>
        <RouterLink to="/export" class="side-link" active-class="is-active"><PhDownloadSimple :size="18" aria-hidden="true" /> Télécharger mon PDF</RouterLink>
        <ResetConfirm @done="router.push('/')" />
      </div>
    </aside>

    <!-- Mobile : barre collante -->
    <header class="bar">
      <RouterLink to="/" class="bar-logo" aria-label="Accueil">
        <img src="/favicon.png" alt="" width="32" height="32" />
      </RouterLink>
      <div class="bar-text">
        <p class="bar-family">
          <template v-if="family">{{ family.number }}. {{ family.title }}</template>
          <template v-else>Mon catalogue des possibilités</template>
        </p>
        <p class="bar-theme">{{ themeTitle && family ? themeTitle : heading ?? family?.title }}</p>
      </div>
      <button type="button" class="icon-btn" aria-label="Rechercher" @click="searchOpen = true"><PhMagnifyingGlass :size="22" /></button>
      <button type="button" class="icon-btn" aria-label="Ouvrir le sommaire" :aria-expanded="sheetOpen" @click="sheetOpen = true">
        <PhListBullets :size="22" />
      </button>
      <div class="bar-track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" aria-label="Part du catalogue parcourue">
        <span class="fill" :style="{ transform: `scaleX(${store.progress.value})` }" />
      </div>
    </header>

    <main id="contenu" class="content">
      <slot />
    </main>

    <BottomSheet :open="sheetOpen" title="Sommaire" @close="sheetOpen = false">
      <p class="sheet-progress">{{ percent }}&nbsp;% du catalogue parcouru</p>
      <Sommaire :current-family-id="family?.id ?? null" @navigate="sheetOpen = false" />
      <div class="sheet-links">
        <RouterLink to="/bilan" class="btn btn-ghost" @click="sheetOpen = false"><PhNotePencil :size="18" aria-hidden="true" /> Mon bilan</RouterLink>
        <RouterLink to="/export" class="btn btn-ghost" @click="sheetOpen = false"><PhDownloadSimple :size="18" aria-hidden="true" /> Mon PDF</RouterLink>
      </div>
      <ResetConfirm
        @done="
          () => {
            sheetOpen = false
            router.push('/')
          }
        "
      />
    </BottomSheet>
    <SearchDialog />
  </div>
</template>

<style scoped>
.journey {
  --bar-h: 64px;
  min-height: 100svh;
}
.side {
  display: none;
}
.bar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--bar-h);
  padding: 0 4px 0 var(--gutter);
  background: rgb(246 250 248 / 0.92);
  backdrop-filter: saturate(1.4) blur(12px);
  -webkit-backdrop-filter: saturate(1.4) blur(12px);
  border-bottom: 1px solid var(--rule);
}
.bar-logo img {
  width: 30px;
  height: 30px;
}
.bar-text {
  flex: 1;
  min-width: 0;
  padding-left: 10px;
}
.bar-family {
  color: var(--fam-ink);
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-theme {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  background: var(--fam-accent);
  transform-origin: left;
  transition: transform 450ms var(--ease-out);
}
.sheet-progress {
  padding: 0 10px 8px;
  color: var(--muted);
  font-size: var(--step--1);
}
.sheet-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 10px 8px;
}

@media (min-width: 1024px) {
  .journey {
    --bar-h: 0px;
    display: grid;
    grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  }
  .bar {
    display: none;
  }
  .side {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100svh;
    border-right: 1px solid var(--rule);
    background: var(--paper);
  }
  .side-top {
    display: grid;
    gap: 18px;
    padding: 24px 20px 16px;
  }
  .side-logo img {
    width: 84px;
    height: auto;
  }
  .progress-text {
    display: flex;
    justify-content: space-between;
    font-size: var(--step--1);
    margin-bottom: 6px;
  }
  .progress-text strong {
    color: var(--ink);
  }
  .track {
    height: 6px;
    border-radius: 3px;
    background: var(--mist);
    overflow: hidden;
  }
  .search-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: var(--radius-pill);
    background: var(--white);
    box-shadow: inset 0 0 0 1.5px var(--rule);
    color: var(--muted);
    font-size: 0.9rem;
    transition: box-shadow 160ms ease;
  }
  .search-trigger:hover {
    box-shadow: inset 0 0 0 1.5px var(--muted);
  }
  .side-scroll {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4px 12px 16px;
    scrollbar-width: thin;
  }
  .side-bottom {
    display: grid;
    gap: 2px;
    padding: 12px;
    border-top: 1px solid var(--rule);
  }
  .side-link {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 12px;
    border-radius: var(--radius-s);
    color: var(--ink);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
  }
  .side-link:hover,
  .side-link.is-active {
    background: var(--mist);
  }
}
</style>
