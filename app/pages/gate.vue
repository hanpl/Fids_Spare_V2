<template>
  <div v-if="currentFlight">
    <div class="header">
      <div class="logo">
        <img class="logoaht" :src="`/img/AHTLogo2.png?timestamp=${new Date().getTime()}`" alt="" title="">
      </div>
      <div class="text">
        <p>GATE {{ currentFlight.gate }}</p>
      </div>
    </div>

    <div class="mainboard form-group row styleFromcontrol">
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
            <span class="mcdt">{{ gettemprate(currentFlight.city) }}</span>
          </div>
        </div>

        <!-- ← THAY ĐỔI: dùng logoUrl từ API thay vì src cứng -->
        <div class="logoairline">
          <img v-if="airlineLogoUrl"
            :src="airlineLogoUrl"
            :alt="currentFlight.lineCode"
            @error="onLogoError" />
          <img v-else
            :src="`/img/fullscreen/AHT_1920x1080.png?timestamp=${new Date().getTime()}`"
            alt="AHT" />
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="date">{{ date }}</p>
    </div>
  </div>

  <!-- Fallback khi không có chuyến bay -->
  <div v-else>
    <img  alt="Vuelogo" :src="`/img/fullscreen/AHT_1920x1080.png?timestamp=${new Date().getTime()}`" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import * as signalR from '@microsoft/signalr'

const config = useRuntimeConfig()
const timeCheckFlight = 30
const timeLoadFlight  = 40

definePageMeta({ layout: 'checkinlayout' })

// ── useAirlineLogos ──────────────────────────────────────
// Dùng FullScreen vì đây là màn hình gate hiển thị toàn màn hình
const { loadAll, getLogoUrl } = useAirlineLogos('FullScreen')

interface Flight {
  id: string; scheduledDate: string; schedule: string; estimated: string
  actual: string; lineCode: string; flight: string; city: string
  gate: string; remark: string; status: string; rowFrom: string; rowTo: string
  checkInCounters: string; counterStart: string; counterEnd: string
  gateStart: string; gateEnd: string; mcdt: string
}

const flights       = ref<Flight[]>([])
const currentFlight = ref<Flight | null>(null)
const date          = ref('')
const countries     = reactive({
  cityMap: [
    { codeAirport: 'BHY', nameAirport: 'Beihai',  countries: 'Trung Quốc' },
    { codeAirport: 'ICN', nameAirport: 'Incheon', countries: 'Hàn Quốc'  }
  ]
})

// ── Logo URL tự động cập nhật khi currentFlight thay đổi ─
const airlineLogoUrl = computed(() => {
  if (!currentFlight.value?.lineCode) return ''
  const url = getLogoUrl(currentFlight.value.lineCode)
  console.log(`[Gate] lineCode: ${currentFlight.value.lineCode} → ${url || 'KHÔNG CÓ'}`)
  return url
})

function onLogoError(e: Event) {
  console.warn('[Gate] Lỗi load logo:', airlineLogoUrl.value)
  const img = e.target as HTMLImageElement
  img.src = '/img/fullscreen/AHT_1920x1080.png'
}

// ── Fetch flights ─────────────────────────────────────────
const fetchFlights = async () => {
  try {
    const data = await $fetch<Flight[]>(`${config.public.apiBase}/Gate`)
    flights.value = data
    checkCurrentFlight()
  } catch (error) {
    console.error('[Gate] fetchFlights error:', error)
  }
}

const parseDate = (dateString: string): Date => {
  const normalized = dateString.replace(/\s+/g, ' ').replace(/(\d+)(AM|PM)$/, '$1 $2')
  return new Date(normalized)
}

const checkCurrentFlight = () => {
  const now = new Date()
  const filtered = flights.value.filter(flight => {
    const mcdtDate  = parseDate(flight.mcdt)
    const timeBefore = new Date(mcdtDate.getTime() - 150 * 60 * 1000)
    const timeAfter  = new Date(mcdtDate.getTime() +  20 * 60 * 1000)
    return now >= timeBefore && now <= timeAfter
  })

  if (filtered.length > 0) {
    filtered.sort((a, b) => parseDate(a.mcdt).getTime() - parseDate(b.mcdt).getTime())
    currentFlight.value = filtered[0] ?? null
  } else {
    currentFlight.value = null
  }
}

const getdatefooter = () => {
  date.value = format(new Date(), 'dd MMMM yyyy | HH:mm:ss')
}

const getTimeMcdt = (mcdt: string): string => {
  const d = parseDate(mcdt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const gettemprate = (_city: string): string => ''

const loadCityMap = async () => {
  try {
    const data = await $fetch<any[]>(`${config.public.apiBase}/Countries`)
    countries.cityMap = data
  } catch (error) {
    console.error('[Gate] loadCityMap error:', error)
  }
}

const getFullCityName = (shortCode: string): string => {
  const airport = countries.cityMap.find(a => a.codeAirport === shortCode)
  return airport ? airport.nameAirport : 'Not Found'
}

// ── SignalR ───────────────────────────────────────────────
const intervalId   = ref<number | null>(null)
const hubConnection = ref<signalR.HubConnection | null>(null)

const connectHub = async () => {
  hubConnection.value = new signalR.HubConnectionBuilder()
    .withUrl(`${config.public.urlHub}`)
    .configureLogging(signalR.LogLevel.Information)
    .build()
  try {
    await hubConnection.value.start()
    console.log('[Gate] SignalR connected')
  } catch (err) {
    console.error('[Gate] SignalR failed:', err)
    startInterval()
  }
  hubConnection.value.onclose(() => {
    console.log('[Gate] Connection closed')
    startInterval()
  })
}

const reconnectHub = async () => {
  try {
    await hubConnection.value?.start()
    console.log('[Gate] SignalR reconnected')
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  } catch (err) {
    console.error('[Gate] Reconnect failed:', err)
  }
}

const startInterval = () => {
  if (intervalId.value !== null) clearInterval(intervalId.value)
  intervalId.value = window.setInterval(reconnectHub, 30000)
}

// ── onMounted ─────────────────────────────────────────────
onMounted(async () => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  await loadAll()         
  await connectHub()
  await fetchFlights()
  await loadCityMap()

  getdatefooter()          // ← gọi có () mới chạy được
  setInterval(getdatefooter,     1000)
  setInterval(checkCurrentFlight, timeCheckFlight * 1000)
  setInterval(fetchFlights,       timeLoadFlight  * 1000)
})

console.log('[Gate] script setup END — waiting for onMounted')
</script>
  
  <style scoped>


.mainboard {
    width: 100%;
    display: flex;
    overflow: hidden;
    position: relative;
    height: 73.3vh;
    background-color: #283b92;
    margin-right: 0px !important;
    margin-left: 0px !important;
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
    padding: 0px 0.5rem;
    height: 20vh;
}
.logoaht {
    max-height: 100%;
    width: auto;
}
.logo {
    height: 100%;
}
.text {
    color: #121441;
    font-weight: 700;
    font-size: large;
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
  