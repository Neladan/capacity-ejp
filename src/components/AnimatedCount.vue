<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate } from 'motion-v'
import { formatNumber } from '../lib/fr'
import { reducedMotion } from '../lib/haptics'

const props = withDefaults(defineProps<{ value: number; from?: number; duration?: number; delay?: number; startOnMount?: boolean }>(), {
  from: 0,
  duration: 0.45,
  delay: 0,
  startOnMount: true,
})

const shown = ref(props.startOnMount ? props.from : props.value)
let controls: { stop: () => void } | null = null

function run(from: number, to: number) {
  controls?.stop()
  if (reducedMotion() || from === to) {
    shown.value = to
    return
  }
  controls = animate(from, to, {
    duration: props.duration,
    delay: props.delay,
    ease: [0.23, 1, 0.32, 1],
    onUpdate: (v: number) => (shown.value = Math.round(v)),
  })
}

onMounted(() => props.startOnMount && run(props.from, props.value))
watch(
  () => props.value,
  (to, from) => run(from ?? 0, to),
)
onBeforeUnmount(() => controls?.stop())
</script>

<template>
  <span class="count" aria-hidden="true">{{ formatNumber(shown) }}</span>
  <span class="sr-only">{{ formatNumber(value) }}</span>
</template>

<style scoped>
.count {
  font-variant-numeric: tabular-nums;
}
</style>
