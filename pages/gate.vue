<template>
  <div v-if="currentFlight">
    <div class="header">
      <div class="logo">
        <img class="logoaht" :src="`${config.public.apiBase}/images/logo/AHTLogo2.png`" alt="AHT">
      </div>
      <div class="text">
        <p>GATE {{ currentFlight.gate }}</p>
      </div>
    </div>
    <div class="mainboard form-group row">
      <div class="col-sm-6">
        <div class="row" style="padding-left: 5vw;">
          <div class="timemcdt">
            <span>FLIGHT</span>
            <span class="mcdt">{{ currentFlight.flight }}</span>
          </div>
        </div>
        <div class="row" style="padding-left: 5vw;">
          <div class="timemcdt">
            <span>CITY TO</span>
            <span class="mcdt">{{ getFullCityName(currentFlight.city) }}</span>
          </div>
        </div>
        <div class="row" style="padding-left: 5vw;">
          <div class="timemcdt">
            <span>STATUS</span>
            <span class="mcdt">{{ currentFlight.remark }}</span>
          </div>
        </div>
        <div class="row" style="padding-left: 5vw;">
          <div class="timemcdt">
            <span>NOTE</span>
            <span class="mcdt"></span>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="row">
          <div class="col-sm-6 timemcdt">
            <span>TIME</span>
            <span class="mcdt">{{ getTimeMcdt(currentFlight.mcdt) }}</span>
          </div>
          <div class="col-sm-6 timemcdt">
            <span></span>
            <span class="mcdt"></span>
          </div>
        </div>
        <div class="logoairline">
          <img alt="" :src="`${config.public.apiBase}/images/fullscreen/${currentFlight.lineCode}_1920x1080.png`"
            @error="currentFlight.lineCode = 'AHT'" style="overflow: hidden;" />
        </div>
      </div>
    </div>
    <div class="footer">
      <p class="date">{{ date }}</p>
    </div>
  </div>
  <div v-else>
    <img alt="AHT" :src="`${config.public.apiBase}/images/fullscreen/AHT_1920x1080.png`"
      style="width: 100vw; height: 100vh; object-fit: cover;" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'

definePageMeta({ layout: 'checkinlayout' })

const config = useRuntimeConfig()
const { loadCityMap, getFullCityName } = useCityMap()
const { connect: connectHub, disconnect: disconnectHub } = useSignalR(`${config.public.hubBase}/dashboardHub`)

const TIME_CHECK_FLIGHT = 30
const TIME_LOAD_FLIGHT = 40

interface Flight {
  id: string; scheduledDate: string; schedule: string; estimated: string; actual: string
  lineCode: string; flight: string; city: string; gate: string; remark: string; status: string
  rowFrom: string; rowTo: string; checkInCounters: string; counterStart: string; counterEnd: string
  gateStart: string; gateEnd: string; mcdt: string
}

const flights = ref<Flight[]>([])
const currentFlight = ref<Flight | null>(null)
const date = ref('')
const dateTimerId = ref<number | null>(null)
const checkTimerId = ref<number | null>(null)
const loadTimerId = ref<number | null>(null)

const parseMcdt = (dateString: string): Date =>
  new Date(dateString.replace(/\s+/g, ' ').replace(/(\d+)(AM|PM)$/, '$1 $2'))

const fetchFlights = async () => {
  try {
    const data = await $fetch<Flight[]>(`${config.public.apiBase}/api/Gate`)
    flights.value = data
    checkCurrentFlight()
  } catch (err) {
    console.error('Failed to fetch gate flights:', err)
  }
}

const checkCurrentFlight = () => {
  const now = new Date()
  const filtered = flights.value.filter((flight) => {
    const mcdt = parseMcdt(flight.mcdt)
    return now >= new Date(mcdt.getTime() - 150 * 60 * 1000) &&
           now <= new Date(mcdt.getTime() + 20 * 60 * 1000)
  })
  if (filtered.length > 0) {
    filtered.sort((a, b) => parseMcdt(a.mcdt).getTime() - parseMcdt(b.mcdt).getTime())
    currentFlight.value = filtered[0]
  } else {
    currentFlight.value = null
  }
}

const getTimeMcdt = (mcdt: string): string => {
  const d = parseMcdt(mcdt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const updateDate = () => {
  date.value = format(new Date(), 'dd MMMM yyyy |HH:mm:ss')
}

onMounted(async () => {
  await connectHub()
  await fetchFlights()
  await loadCityMap()
  updateDate()
  dateTimerId.value = window.setInterval(updateDate, 1000)
  checkTimerId.value = window.setInterval(checkCurrentFlight, TIME_CHECK_FLIGHT * 1000)
  loadTimerId.value = window.setInterval(fetchFlights, TIME_LOAD_FLIGHT * 1000)
})

onUnmounted(async () => {
  if (dateTimerId.value !== null) clearInterval(dateTimerId.value)
  if (checkTimerId.value !== null) clearInterval(checkTimerId.value)
  if (loadTimerId.value !== null) clearInterval(loadTimerId.value)
  await disconnectHub()
})
</script>

<style scoped>
.footer {
  background-color: #36c0c7;
  left: 0;
  width: 100vw;
  height: 6.6vh;
  position: fixed;
  bottom: 0;
  padding: 5px;
}
p.date {
  color: #2b388f;
  padding-right: 4vw;
  font-size: 3.5vh;
  float: right;
  padding-top: 1.8vh;
  font-weight: 600;
}
.mainboard {
  width: 100%;
  display: flex;
  overflow: hidden;
  position: relative;
  height: 73.3vh;
  background-color: #283b92;
  margin-right: 0 !important;
  margin-left: 0 !important;
}
.logoairline {
  width: 99%;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4vh;
}
.logoairline img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.timemcdt {
  display: flex;
  flex-direction: column;
  color: #36c0c7;
  font-size: 3.8vh;
  align-items: flex-start;
  margin-top: 5vh;
  font-weight: 700;
}
span.mcdt {
  font-size: 11vh;
  padding-top: 5vh;
  padding-bottom: 4vh;
  color: white;
  font-weight: 700;
}
.header {
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0.5rem;
  height: 20vh;
}
.logoaht { max-height: 100%; width: auto; }
.logo { height: 100%; }
.text {
  color: #121441;
  font-weight: 700;
  margin-left: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60vw;
  height: 100%;
}
p {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  color: #2b388f;
  font-weight: 700;
  font-size: 5.2vw;
}
</style>
