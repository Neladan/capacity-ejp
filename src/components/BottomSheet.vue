<script setup lang="ts">
import { ref, toRef } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import { useFocusTrap } from '../composables/useFocusTrap'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement>()
useFocusTrap(toRef(props, 'open'), panel, () => emit('close'))

/* Glisser vers le bas pour fermer : distance ou vitesse suffisent (principe de Vaul). */
let startY = 0
let startT = 0
let dy = 0
let dragging = false

function onDown(e: PointerEvent) {
  if (dragging || !e.isPrimary) return
  dragging = true
  startY = e.clientY
  startT = performance.now()
  dy = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  if (panel.value) panel.value.style.transition = 'none'
}
function onMove(e: PointerEvent) {
  if (!dragging || !panel.value) return
  const raw = e.clientY - startY
  // Vers le haut : friction plutôt qu'un arrêt net.
  dy = raw < 0 ? -Math.sqrt(-raw) * 2 : raw
  panel.value.style.transform = `translateY(${dy}px)`
}
function onUp() {
  if (!dragging || !panel.value) return
  dragging = false
  const velocity = Math.abs(dy) / Math.max(1, performance.now() - startT)
  panel.value.style.transition = ''
  panel.value.style.transform = ''
  if (dy > 120 || (dy > 10 && velocity > 0.11)) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-root">
        <div class="overlay" aria-hidden="true" @click="emit('close')" />
        <div ref="panel" class="sheet" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
          <div class="handle-zone" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
            <span class="handle" aria-hidden="true" />
            <div class="head">
              <h2 class="title">{{ title }}</h2>
              <button type="button" class="icon-btn" aria-label="Fermer" data-autofocus @click="emit('close')"><PhX :size="20" /></button>
            </div>
          </div>
          <div class="body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-root {
  position: fixed;
  inset: 0;
  z-index: 60;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgb(16 59 51 / 0.42);
  transition: opacity 360ms var(--ease-drawer);
}
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-height: 86svh;
  border-radius: 24px 24px 0 0;
  background: var(--paper);
  box-shadow: var(--shadow-lift);
  transition: transform 360ms var(--ease-drawer);
  outline: none;
  will-change: transform;
}
.handle-zone {
  flex: none;
  padding: 8px 12px 4px 20px;
  touch-action: none;
  cursor: grab;
}
.handle {
  display: block;
  width: 40px;
  height: 5px;
  margin: 0 auto 6px;
  border-radius: 3px;
  background: var(--rule);
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: var(--step-1);
}
.body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 12px max(20px, env(safe-area-inset-bottom));
}
.sheet-enter-from .overlay,
.sheet-leave-to .overlay {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
.sheet-leave-active .sheet,
.sheet-leave-active .overlay {
  transition-duration: 240ms;
}
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 360ms;
}
@media (prefers-reduced-motion: reduce) {
  .sheet-enter-from .sheet,
  .sheet-leave-to .sheet {
    transform: none;
    opacity: 0;
  }
  .sheet {
    transition: opacity 200ms ease;
  }
}
</style>
