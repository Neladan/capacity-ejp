<script setup lang="ts">
import { MotionConfig } from 'motion-v'
</script>

<template>
  <MotionConfig reduced-motion="user">
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <RouterView />
  </MotionConfig>
</template>
