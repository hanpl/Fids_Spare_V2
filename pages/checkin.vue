<template>
  <div>
    <div v-if="Model">
      <div v-if="isOnTime">
        <div v-if="Nomal">
          <img alt="" :src="`${config.public.apiBase}/images/1920x480/${showImghafl}`"
            @error="showImghafl = 'Logo_1920x480.png'"
            style="overflow: hidden; max-width: 100vw; height: 44.5vh; background-color: #244093;" />
          <div class="noidungtext" style="background-color: #244093; max-width: 100vw; height: 55.5vh;">
            <span>{{ destination }}</span>
            <div class="flightTime">
              <span>{{ flight }}</span>
              <span>{{ time }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <img alt="" :src="`${config.public.apiBase}/images/fullscreen/${showImg}`"
            @error="showImg = 'AHT_1920x1080.png'"
            style="overflow: hidden; max-width: 100vw; height: auto;" />
        </div>
      </div>
      <div v-else>
        <img :src="`${config.public.apiBase}/images/fullscreen/${images[currentIndex]}`"
          class="slideshow-image" alt="" />
      </div>
    </div>
    <div v-else>
      <img v-if="isManual"
        :src="`${config.public.apiBase}/images/fullscreen/${images[currentIndex]}`"
        class="slideshow-image" alt="" />
      <img v-else
        :src="`${config.public.apiBase}/images/fullscreen/${showImgManual}`"
        @error="showImgManual = 'AHT_1920x1080.png'"
        class="slideshow-image" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'checkinlayout' })

const config = useRuntimeConfig()
const { loadCityMap, getFullCityName } = useCityMap()
const { connect: connectHub, disconnect: disconnectHub, hubConnection } = useSignalR(
  `${config.public.hubBase}/dashboardHub`
)

const Model = ref(false)
const Nomal = ref(true)
const isOnTime = ref(true)
const isManual = ref(true)
const showImgManual = ref('')
const showImg = ref('')
const showImghafl = ref('')
const destination = ref('')
const flight = ref('')
const time = ref('')
const nameCounter = ref<string | null>(null)
const location = ref<string | null>(null)
const timeClose = ref<Date | null>(null)
const timeStart = ref<Date | null>(null)

const images = ref(['AHT1.png', 'AHT2.png', 'AHT3.png', 'AHT4.png'])
const currentIndex = ref(0)
const slideshowTimerId = ref<number | null>(null)
const checkTimerId = ref<number | null>(null)

const formattedTime = (val: string) => {
  const d = new Date(val)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const setupSignalRHandlers = () => {
  hubConnection.value!.off('SendToClient')
  hubConnection.value!.on('SendToClient', (data: any) => {
    timeStart.value = new Date(`${data.openTime}`)
    timeClose.value = new Date(`${data.closeTime}`)
    destination.value = getFullCityName(`${data.setImg}`)
    flight.value = `${data.flight}`
    time.value = formattedTime(`${data.timeMcdt}`)
    nameCounter.value = `${data.name}`
    location.value = `${data.location}`
    isManual.value = data.auto !== 'False'
    Model.value = isManual.value && new Date() >= timeStart.value
    Nomal.value = data.mode === 'Nomal' && new Date() < timeClose.value && new Date() > timeStart.value
    isOnTime.value = new Date() < timeClose.value && new Date() > timeStart.value
    showImg.value = data.mode === 'Eco'
      ? (data.eco || `${data.autoImg}_1920x1080.png`)
      : (data.bus || `${data.autoImg}_1920x1080.png`)
    showImgManual.value = data.manual || `${data.autoImg}_1920x1080.png`
    showImghafl.value = data.nomal || `${data.autoImg}_1920x480.png`
    startCheckingFlights()
  })
}

const checkFlightsAndDelete = () => {
  if (!timeClose.value || !timeStart.value) return
  const now = new Date()
  if (now > timeClose.value) {
    hubConnection.value?.invoke('DeleteFlightFromClient', nameCounter.value, location.value)
      .catch(err => console.error('Delete flight error:', err))
  } else if (now < timeStart.value) {
    isOnTime.value = false
  } else {
    isOnTime.value = true
    Model.value = isManual.value
  }
}

const startCheckingFlights = () => {
  if (checkTimerId.value !== null) clearInterval(checkTimerId.value)
  checkTimerId.value = window.setInterval(checkFlightsAndDelete, 30000)
}

onMounted(async () => {
  await loadCityMap()
  await connectHub(setupSignalRHandlers)
  slideshowTimerId.value = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.value.length
  }, 15000)
})

onUnmounted(async () => {
  if (slideshowTimerId.value !== null) clearInterval(slideshowTimerId.value)
  if (checkTimerId.value !== null) clearInterval(checkTimerId.value)
  await disconnectHub()
})
</script>

<style scoped>
.noidungtext {
  font-size: 15vh;
  font-weight: bold;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
.flightTime {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100vw;
}
</style>
