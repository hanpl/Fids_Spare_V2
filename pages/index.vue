<template>
  <Gate v-if="mode === 'Gate'" />
  <Checkin v-else-if="mode === 'Checkin'" />
  <Dep v-else-if="mode === 'Dep'" />
  <Arr v-else-if="mode === 'Arr'" />
  <!-- Additional modes will be added as pages are migrated -->
  <div v-else class="fallback-screen">
    <img :src="`${config.public.apiBase}/images/fullscreen/AHT_1920x1080.png`" alt="AHT" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Gate from './gate.vue'
import Checkin from './checkin.vue'
import Dep from './Departures.vue'
import Arr from './Arrival.vue'

const config = useRuntimeConfig()
const mode = ref('')
const refreshTimerId = ref<number | null>(null)

const fetchMode = async () => {
  try {
    const data = await $fetch<Array<{ description: string }>>(`${config.public.apiBase}/api/FidsLocation`)
    mode.value = data.length > 0 ? data[0].description.trim() : ''
  } catch (err) {
    console.error('Failed to fetch device mode:', err)
  }
}

onMounted(async () => {
  await fetchMode()
  // Re-check every 60s so server-side layout changes take effect automatically
  refreshTimerId.value = window.setInterval(fetchMode, 60000)
})

onUnmounted(() => {
  if (refreshTimerId.value !== null) clearInterval(refreshTimerId.value)
})
</script>

<style scoped>
.fallback-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #121441;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fallback-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
