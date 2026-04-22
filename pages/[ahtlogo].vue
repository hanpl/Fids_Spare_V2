<template>
  <img alt="AHT" :src="`${config.public.apiBase}/images/fullscreen/AHT_1920x1080.png`" class="fullscreen-img" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'checkinlayout' })
const config = useRuntimeConfig()
</script>

<style scoped>
.fullscreen-img {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  display: block;
}
</style>
