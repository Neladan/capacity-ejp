<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'
import { PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue'
import { catalogue } from '../data/catalogue'
import { useAnswers } from '../store/answers'
import { fr } from '../lib/fr'
import { easeOut } from '../lib/motion'
import ArcMotif from '../components/ArcMotif.vue'

const router = useRouter()
const store = useAnswers()
const name = ref(store.state.name)
const input = ref<HTMLInputElement>()

onMounted(() => input.value?.focus({ preventScroll: true }))

function go() {
  store.setName(name.value.trim())
  store.setPosition({ familyId: catalogue.families[0].id, themeId: null })
  router.push({ name: 'family', params: { familyId: catalogue.families[0].id } })
}
</script>

<template>
  <main id="contenu" class="name-view on-deep">
    <ArcMotif />
    <RouterLink to="/" class="icon-btn back" aria-label="Retour à l’accueil"><PhArrowLeft :size="22" /></RouterLink>
    <motion.form
      class="card"
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, ease: easeOut }"
      @submit.prevent="go"
    >
      <label for="prenom" class="q">{{ fr('Comment t’appelles-tu ?') }}</label>
      <p class="lede hint">Facultatif. Ton prénom sert seulement à personnaliser ton PDF, il reste sur cet appareil.</p>
      <input
        id="prenom"
        ref="input"
        v-model="name"
        class="field"
        type="text"
        autocomplete="given-name"
        autocapitalize="words"
        enterkeyhint="go"
        maxlength="60"
        placeholder="Ton prénom"
      />
      <div class="actions">
        <button type="submit" class="btn btn-primary">
          {{ name.trim() ? 'Continuer' : 'Continuer sans prénom' }}
          <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </motion.form>
  </main>
</template>

<style scoped>
.name-view {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 72px var(--gutter) 48px;
  background: var(--deep);
}
.back {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  left: 8px;
  color: var(--mint);
}
@media (hover: hover) and (pointer: fine) {
  .back:hover {
    background: var(--deep-2);
  }
}
.card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  width: 100%;
  max-width: 460px;
  padding: clamp(24px, 6vw, 40px);
  border-radius: var(--radius-l);
  background: var(--paper);
  box-shadow: var(--shadow-lift);
}
.q {
  color: var(--deep);
  font-size: var(--step-2);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.hint {
  color: var(--text);
}
.field {
  min-height: 56px;
  padding: 0 18px;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--white);
  box-shadow: inset 0 0 0 1.5px var(--rule);
  color: var(--ink);
  font-size: 1.1rem;
  transition: box-shadow 160ms ease;
}
.field:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--ejp);
}
.field::placeholder {
  color: var(--muted);
}
.actions {
  margin-top: 6px;
}
.actions .btn {
  width: 100%;
}
</style>
