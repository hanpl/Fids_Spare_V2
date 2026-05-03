<template>
  <div class="entrance-page">
    <div class="hearder1">
      <Banner :msg="['AV.jpg', 'AE.jpg', 'AH.jpg', 'AT.jpg']" />
    </div>

    <div class="hearder2">
      <div
        v-for="item in logoList"
        :key="item.id ?? item.lineCode"
        class="divlogo">
        <AirlineLogo
          :line-code="item.lineCode || 'AHT'"
          location="Entrance" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Banner from '~/components/Banner.vue'

interface EntranceLogoItem {
  id?: string | number
  lineCode: string
  code: []
  schedule?: string
  flight?: string
  mcdt?: string
  rowFrom?: string
  rowTo?: string
}

const config = useRuntimeConfig()
const { loadAll, startPolling, stopPolling } = useAirlineLogos('Entrance')

const logoList = ref<EntranceLogoItem[]>([])
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)


const loadLogo = async () => {
  try {
    const data = await $fetch<EntranceLogoItem[]>(`${config.public.apiBase}/EntranceA`)
    logoList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load Entrance logos:', error)
    logoList.value = []
  }
}

onMounted(async () => {
  await loadAll()
  startPolling()
  await loadLogo()

  refreshInterval.value = setInterval(loadLogo, 60000)
})

onUnmounted(() => {
  stopPolling()

  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})
</script>


<style scoped>
.entrance-page {
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background-color: white;
}

.hearder1 {
  display: flex;
  /* max-height: 16vh; */
  top: 0;
}

.hearder1 :deep(img.hearder) {
  width: 100%;
  max-height: 22vh;
  object-fit: cover;
}

.hearder2 {
  width: 100vw;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding-left: 0.5vw;
  align-content: flex-start;
}

.divlogo {
  width: 33vw;
  height: 26vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.divlogo :deep(.Vuelogocl) {
  width: 33vw;
  height: 26vh;
  object-fit: contain;
}
</style>
