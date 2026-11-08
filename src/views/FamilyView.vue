<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhEye, PhEyeSlash } from '@phosphor-icons/vue'
import { familyById } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { currentThemeId, hideSeen, onlyMine, scrollToId } from '../composables/useJourney'
import JourneyLayout from '../components/JourneyLayout.vue'
import FamilyCover from '../components/FamilyCover.vue'
import ThemeSection from '../components/ThemeSection.vue'
import FamilyRecap from '../components/FamilyRecap.vue'

const props = defineProps<{ familyId: string }>()
const router = useRouter()
const route = useRoute()
const store = useAnswers()

const family = computed(() => familyById(props.familyId))
if (!family.value) router.replace('/')

const openId = ref<number | null>(null)
/** Thèmes parcourus que la personne a choisi de rouvrir malgré le filtre. */
const reopened = ref(new Set<string>())

const hiddenCount = computed(() => family.value?.themes.filter((t) => store.state.seenThemes.includes(t.id)).length ?? 0)

watch(
  () => props.familyId,
  () => {
    openId.value = null
    reopened.value = new Set()
    currentThemeId.value = null
    store.setPosition({ familyId: props.familyId, themeId: null })
    observe()
  },
)

/* Thème en cours : celui qui occupe le haut de l'écran. */
let io: IntersectionObserver | null = null
function observe() {
  io?.disconnect()
  requestAnimationFrame(() => {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.themeId!
            currentThemeId.value = id
            store.setPosition({ familyId: props.familyId, themeId: id })
          }
        }
      },
      { rootMargin: '-30% 0px -65% 0px' },
    )
    document.querySelectorAll('[data-theme-id]').forEach((el) => io!.observe(el))
  })
}

onMounted(() => {
  if (family.value) store.setPosition({ familyId: props.familyId, themeId: store.state.position?.themeId ?? null })
  observe()
  if (route.hash) scrollToId(route.hash.slice(1))
})
onBeforeUnmount(() => {
  io?.disconnect()
  currentThemeId.value = null
})
</script>

<template>
  <JourneyLayout v-if="family" :family="family">
    <div :key="family.id" class="family-page">
      <FamilyCover :family="family" />
      <div class="themes-wrap">
        <div class="toolbar" role="group" aria-label="Affichage">
          <button type="button" class="toggle" role="switch" :aria-checked="onlyMine" @click="onlyMine = !onlyMine">
            <span class="switch" aria-hidden="true"><span class="knob" /></span>
            Afficher seulement mes choix
          </button>
          <button type="button" class="btn btn-ghost small" :aria-pressed="hideSeen" @click="hideSeen = !hideSeen">
            <component :is="hideSeen ? PhEye : PhEyeSlash" :size="18" aria-hidden="true" />
            {{ hideSeen ? 'Tout voir' : 'Masquer ce que j’ai déjà parcouru' }}
            <span v-if="!hideSeen && hiddenCount" class="small-count">{{ hiddenCount }}</span>
          </button>
        </div>
        <ThemeSection
          v-for="(t, i) in family.themes"
          :key="t.id"
          v-model:open-id="openId"
          :theme="t"
          :index="i + family.number * 3"
          :only-mine="onlyMine"
          :collapsed="hideSeen && store.state.seenThemes.includes(t.id) && !reopened.has(t.id)"
          @expand="reopened = new Set([...reopened, t.id])"
        />
        <FamilyRecap :family="family" />
      </div>
    </div>
  </JourneyLayout>
</template>

<style scoped>
.themes-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 20px 0 8px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: var(--ink);
  font-size: 0.9rem;
  font-weight: 600;
}
.switch {
  position: relative;
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background: var(--rule);
  transition: background-color 200ms ease;
}
.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  transition: transform 220ms var(--ease-out);
}
.toggle[aria-checked='true'] .switch {
  background: var(--fam-accent);
}
.toggle[aria-checked='true'] .knob {
  transform: translateX(16px);
}
.small {
  min-height: 44px;
  padding: 0 16px;
  font-size: 0.88rem;
}
.small-count {
  padding: 0 7px;
  border-radius: var(--radius-pill);
  background: var(--mist);
  font-size: 0.75rem;
}
</style>
