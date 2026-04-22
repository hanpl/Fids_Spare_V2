<template>
  <HomeAppHeaderArr />
  <section class="content">
    <div class="row">
      <div class="card-body pad table-responsive" style="width: 100vw">
        <table class="table table-hover">
          <thead class="classtheadheader" style="background-color: #36c0c7; height: 6.6vh;">
            <tr>
              <th style="width: 13vw;">TIME</th>
              <th style="width: 19vw;">AIRLINE</th>
              <th style="width: 14vw;">FLIGHT</th>
              <th style="width: 25vw;"><span>FROM</span></th>
              <th style="width: 13vw;">ARRIVAL</th>
              <th style="width: 16vw;">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(flight, index) in pagedGroups" :key="(flight.flight || 'day') + '-' + index">
              <tr v-if="flight.isDaybreak" class="sizerow notice-row" style="height: 13.2vh;">
                <td colspan="6" style="vertical-align: middle;">
                  <div class="notice-content">{{ formatDateToFlightMessage(flight.date) }}</div>
                </td>
              </tr>
              <tr v-else-if="flight.flight" class="sizerow85">
                <td class="midal">{{ formatTime(flight.schedule) }}</td>
                <td class="midal">
                  <img alt="" :src="`${config.public.apiBase}/images/logo/${flight.lineCode}_240x38.png`"
                    @error="flight.lineCode = 'trans'" />
                </td>
                <td class="midal">{{ flight.flight }}</td>
                <td class="midal1">{{ getFullCityName(flight.city) }}</td>
                <td class="midal">{{ formatTime(flight.estimated || flight.schedule) }}</td>
                <td class="midal" :class="statusClass(flight.remark)">{{ flight.remark }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <HomeAppFooter />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const config = useRuntimeConfig()
const { loadCityMap, getFullCityName } = useCityMap()
const { formatTime, formatDateToFlightMessage, groupFlightsByDayWithBreak, paginateFlights } = useFlightPagination()

const statusClass = (remark: string) => ({
  green: remark === 'Arrived',
  red: remark === 'Cancelled',
  yellow: remark === 'Delayed',
})

interface Flight {
  id: string; scheduledDate: string; schedule: string; estimated: string
  actual: string; lineCode: string; flight: string; city: string; belt: string; remark: string
}

interface ConfigDevice {
  id: number; name: string; location: string; description: string; ip: string
  rollOn: number; rollOff: number; pageSize: number; maxPages: number
  pageInterval: number; reloadInterval: number; mobilities: string; connectionId: string
}

const configDevice = ref<ConfigDevice>({
  id: 1, name: '', location: '', description: '', ip: '',
  rollOn: 0, rollOff: 0, pageSize: 8, maxPages: 1,
  pageInterval: 3000, reloadInterval: 180000, mobilities: '', connectionId: ''
})

const pagedGroupsData = ref<any[][]>([])
const currentPage = ref(0)
const rotateTimerId = ref<number | null>(null)
const reloadTimerId = ref<number | null>(null)

const loadConfig = async () => {
  try {
    const data = await $fetch<ConfigDevice>(`${config.public.apiBase}/api/FidsInformation`)
    configDevice.value = data
  } catch (err) {
    console.error('Failed to load device config:', err)
  }
}

const loadFlights = async () => {
  try {
    const data = await $fetch<Flight[]>(`${config.public.apiBase}/api/FidsArrivals`, {
      query: { rollOn: configDevice.value.rollOn, rollOff: configDevice.value.rollOff }
    })
    const grouped = groupFlightsByDayWithBreak(data)
    pagedGroupsData.value = paginateFlights(grouped, configDevice.value.pageSize, configDevice.value.maxPages)
    if (currentPage.value >= pagedGroupsData.value.length) currentPage.value = 0
  } catch (err) {
    console.error('Failed to load arrivals:', err)
  }
}

const startRotation = () => {
  if (rotateTimerId.value !== null) clearInterval(rotateTimerId.value)
  rotateTimerId.value = window.setInterval(() => {
    if (pagedGroupsData.value.length > 0) {
      currentPage.value = (currentPage.value + 1) % pagedGroupsData.value.length
    }
  }, configDevice.value.pageInterval)
}

const pagedGroups = computed(() =>
  pagedGroupsData.value.length ? (pagedGroupsData.value[currentPage.value] ?? []) : []
)

onMounted(async () => {
  await loadCityMap()
  await loadConfig()
  await loadFlights()
  startRotation()
  reloadTimerId.value = window.setInterval(loadFlights, configDevice.value.reloadInterval)
})

onUnmounted(() => {
  if (rotateTimerId.value !== null) clearInterval(rotateTimerId.value)
  if (reloadTimerId.value !== null) clearInterval(reloadTimerId.value)
})
</script>

<style>
@import url("~/assets/css/icheck.css");
body {
  text-align: center !important;
  overflow: hidden;
  background-color: #121441;
}
.card-body { padding: 0rem !important; }
.sizerow85 {
  height: 6.6vh;
  color: white;
  font-size: 3vh;
}
.sizerow85 td {
  padding: 10px;
  text-align: center;
  color: white;
  font-size: 3.9vh;
  vertical-align: middle;
}
.classtheadheader th {
  height: 6.6vh;
  color: #121542;
  font-size: 3vh;
  padding: 10px !important;
  text-align: center;
  vertical-align: middle !important;
}
.midal { vertical-align: middle !important; }
.midal1 {
  vertical-align: middle !important;
  text-align: left !important;
  padding-left: 1.5vw !important;
}
.sizerow85:nth-child(odd) { background-color: #121441; }
.sizerow85:nth-child(even) { background-color: #283b92; }
.table td, .table th {
  padding: 0.25rem;
  border-top: 0px solid #dee2e6 !important;
}
td img {
  text-align: center !important;
  margin: 0;
  width: 100%;
  display: flex;
}
.notice-content {
  font-weight: bold;
  font-size: 3vh;
  color: white;
}
td.green { color: #07e207; }
td.red { color: red; }
td.yellow { color: yellow; }
</style>
