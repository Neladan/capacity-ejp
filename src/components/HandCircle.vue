<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { handCirclePath } from '../lib/hand-circle'
import { easeOut } from '../lib/motion'

const props = withDefaults(defineProps<{ seed: number; color: string; size?: number; animate?: boolean; strokeWidth?: number }>(), {
  size: 48,
  animate: true,
  strokeWidth: 2.4,
})
const d = computed(() => handCirclePath(props.seed))
</script>

<template>
  <svg class="hand-circle" :width="size" :height="size" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <motion.path
      :d="d"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      :initial="animate ? { pathLength: 0, opacity: 0.4 } : false"
      :animate="{ pathLength: 1, opacity: 1 }"
      :transition="{ duration: 0.42, ease: easeOut }"
    />
  </svg>
</template>

<style scoped>
.hand-circle {
  overflow: visible;
  pointer-events: none;
}
</style>
