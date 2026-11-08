<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { PhCheck, PhEye } from '@phosphor-icons/vue'
import type { LevelId, Theme } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { fr } from '../lib/fr'
import { tick } from '../lib/haptics'
import { encouragement } from '../lib/encouragements'
import { highlightId } from '../composables/useJourney'
import ItemRow from './ItemRow.vue'

const props = defineProps<{ theme: Theme; index: number; onlyMine: boolean; collapsed: boolean }>()
const emit = defineEmits<{ expand: [] }>()
const store = useAnswers()

const openId = defineModel<number | null>('openId', { default: null })
const count = computed(() => store.countTheme(props.theme))
const seen = computed(() => store.state.seenThemes.includes(props.theme.id))
const items = computed(() => (props.onlyMine ? props.theme.items.filter((i) => store.levelOf(i.id)) : props.theme.items))

function onToggle(id: number) {
  store.toggle(id)
  tick()
}
function onSet(id: number, level: LevelId | null) {
  store.setLevel(id, level)
  tick()
}

/* Le thème est « parcouru » quand sa fin passe à l'écran. */
const end = ref<HTMLElement>()
let io: IntersectionObserver | null = null
onMounted(() => {
  if (!end.value) return
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !props.onlyMine) {
        store.markThemeSeen(props.theme.id)
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  )
  io.observe(end.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section :id="`theme-${theme.id}`" class="theme" :data-theme-id="theme.id" :aria-labelledby="`titre-${theme.id}`">
    <header class="head">
      <div class="head-text">
        <h2 :id="`titre-${theme.id}`" class="title">{{ theme.title }}</h2>
        <p class="sub">
          {{ theme.items.length }} éléments
          <span v-if="seen" class="seen"><PhCheck :size="12" weight="bold" aria-hidden="true" /> parcouru</span>
        </p>
      </div>
      <p class="counter" :data-zero="count.total === 0" aria-live="polite">
        <motion.span
          :key="count.total"
          class="counter-num"
          :initial="{ scale: 1.22 }"
          :animate="{ scale: 1 }"
          :transition="{ type: 'spring', duration: 0.35, bounce: 0.35 }"
        >
          {{ count.total }}
        </motion.span>
        {{ count.total > 1 ? 'choisis' : 'choisi' }}
      </p>
    </header>

    <div v-if="collapsed" class="collapsed">
      <p>{{ fr('Thème déjà parcouru : il est replié pour t’aider à avancer.') }}</p>
      <button type="button" class="btn btn-quiet" @click="emit('expand')"><PhEye :size="18" aria-hidden="true" /> Revoir ce thème</button>
    </div>
    <template v-else>
      <ul class="items" :aria-label="`Éléments du thème ${theme.title}`">
        <ItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :level="store.levelOf(item.id)"
          :open="openId === item.id"
          :highlight="highlightId === item.id"
          @update:open="(o) => (openId = o ? item.id : null)"
          @toggle="onToggle(item.id)"
          @set-level="(l) => onSet(item.id, l)"
        />
      </ul>
      <p v-if="onlyMine && items.length === 0" class="empty">Aucun choix dans ce thème pour l’instant.</p>
    </template>

    <p ref="end" class="lede encourage">{{ fr(encouragement(index, count.total)) }}</p>
  </section>
</template>

<style scoped>
.theme {
  padding-bottom: 24px;
}
.head {
  position: sticky;
  top: var(--bar-h);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 calc(var(--gutter) * -1);
  padding: 14px var(--gutter) 12px;
  background: rgb(246 250 248 / 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rule);
}
.title {
  color: var(--deep);
  font-size: var(--step-1);
}
.sub {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.78rem;
}
.seen {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--fam-ink);
  font-weight: 600;
}
.counter {
  flex: none;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--fam-tint);
  color: var(--fam-ink);
  font-size: 0.82rem;
  font-weight: 600;
  transition: background-color 200ms ease;
}
.counter[data-zero='true'] {
  background: var(--mist);
  color: var(--muted);
}
.counter-num {
  display: inline-block;
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.items {
  margin: 10px 0 0;
  padding: 0;
  content-visibility: auto;
  contain-intrinsic-size: auto 1900px;
}
.collapsed {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-m);
  background: var(--mist);
  font-size: 0.9rem;
}
.empty {
  padding: 16px 4px;
  color: var(--muted);
  font-size: 0.9rem;
}
.encourage {
  margin: 20px 4px 0;
  padding-left: 16px;
  border-left: 3px solid var(--fam-soft);
  color: var(--fam-ink);
  font-size: var(--step-1);
  line-height: 1.45;
}
</style>
