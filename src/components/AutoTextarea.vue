<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ id: string; label: string; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const el = ref<HTMLTextAreaElement>()
const supportsFieldSizing = typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')

/* Repli pour les navigateurs sans `field-sizing` : hauteur ajustée au contenu. */
function fit() {
  if (supportsFieldSizing || !el.value) return
  el.value.style.height = 'auto'
  el.value.style.height = `${el.value.scrollHeight + 2}px`
}
onMounted(fit)
watch(
  () => props.modelValue,
  () => nextTick(fit),
)
</script>

<template>
  <div class="field">
    <label :for="id" class="label">{{ label }}</label>
    <textarea
      :id="id"
      ref="el"
      class="area"
      rows="3"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 10px;
}
.label {
  color: var(--deep);
  font-weight: 600;
  font-size: var(--step-1);
  line-height: 1.3;
}
.area {
  field-sizing: content;
  min-height: 7.5em;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--white);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--ink);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.05rem;
  line-height: 1.6;
  resize: none;
  overflow: hidden;
  transition: box-shadow 160ms ease;
}
.area:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--ejp);
}
</style>
