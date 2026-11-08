<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { PhArrowCounterClockwise } from '@phosphor-icons/vue'
import { useAnswers } from '../store/answers'
import { fr } from '../lib/fr'

const props = withDefaults(defineProps<{ tone?: 'light' | 'deep' }>(), { tone: 'light' })
const emit = defineEmits<{ done: [] }>()
const store = useAnswers()
const asking = ref(false)
const cancelBtn = ref<HTMLButtonElement>()
const trigger = ref<HTMLButtonElement>()

async function ask() {
  asking.value = true
  await nextTick()
  cancelBtn.value?.focus()
}
async function cancel() {
  asking.value = false
  await nextTick()
  trigger.value?.focus()
}
function confirm() {
  store.reset()
  asking.value = false
  emit('done')
}
</script>

<template>
  <div class="reset" :class="props.tone">
    <button v-if="!asking" ref="trigger" type="button" class="btn btn-quiet trigger" @click="ask">
      <PhArrowCounterClockwise :size="18" aria-hidden="true" />
      Recommencer
    </button>
    <div v-else class="confirm" role="group" aria-labelledby="reset-q" @keydown.esc="cancel">
      <p id="reset-q" class="q">{{ fr('Tout effacer et recommencer à zéro ? Tes réponses et ton bilan seront supprimés de cet appareil.') }}</p>
      <div class="actions">
        <button ref="cancelBtn" type="button" class="btn btn-ghost" @click="cancel">Garder mes réponses</button>
        <button type="button" class="btn danger" @click="confirm">Tout effacer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-m);
  background: var(--white);
  box-shadow: var(--shadow-soft);
  max-width: 440px;
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
  @starting-style {
    opacity: 0;
    transform: translateY(6px);
  }
}
.q {
  color: var(--ink);
  font-size: 0.92rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.danger {
  background: #a3452c;
  color: var(--white);
}
.deep .trigger {
  color: var(--mint);
}
@media (hover: hover) and (pointer: fine) {
  .deep .trigger:hover {
    background: var(--deep-2);
  }
}
</style>
