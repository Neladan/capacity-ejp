<script setup lang="ts">
import type { LevelId } from '../data/catalogue'
import { levelIcon, levelStroke, levelVar } from '../lib/levels'
import HandCircle from './HandCircle.vue'

defineProps<{ level: LevelId | null; seed: number; animate?: boolean }>()
</script>

<template>
  <span class="mark" :data-level="level ?? 'none'">
    <span class="dot" :style="level ? { background: levelVar[level] } : undefined">
      <component :is="levelIcon[level]" v-if="level" :size="15" weight="bold" class="icon" />
    </span>
    <HandCircle v-if="level" :key="level" class="ring" :seed="seed" :color="levelStroke[level]" :size="46" :animate="animate !== false" />
  </span>
</template>

<style scoped>
.mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: none;
}
.dot {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--on-level);
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 220ms var(--ease-out);
}
.mark[data-level='none'] .dot {
  background: var(--white);
}
.mark:not([data-level='none']) .dot {
  box-shadow: none;
  transform: scale(1.04);
}
.icon {
  animation: pop 260ms var(--ease-out);
}
.ring {
  position: absolute;
  inset: 0;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
}
@media (prefers-reduced-motion: reduce) {
  .icon {
    animation: fade 200ms ease;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
}
</style>
