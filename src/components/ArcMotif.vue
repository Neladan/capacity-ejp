<script setup lang="ts">
/* Le grand arc de la couverture du document : un cercle et une arche, en vert profond 2. */
withDefaults(defineProps<{ color?: string; line?: string }>(), { color: 'var(--deep-2)', line: 'rgb(169 217 192 / 0.14)' })
</script>

<template>
  <svg class="arc" viewBox="0 0 800 800" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
    <circle cx="560" cy="560" r="420" :fill="color" />
    <path d="M380 800 V560 a180 180 0 0 1 360 0 V800" fill="none" :stroke="line" stroke-width="2" />
  </svg>
</template>

<style scoped>
.arc {
  position: absolute;
  inset: auto -12% -18% auto;
  width: min(120vw, 980px);
  height: auto;
  pointer-events: none;
}
</style>
