<template>
    <HomeAppHeaderArr85 />
    <section class="content">
      <div class="row">
              <div class="card-body pad table-responsive" style="width: 100vw">
                      <table class="table table-hover" id="tblWorkOrderDone">
                          <thead class="classtheadheader" style="background-color: #36c0c7;height: 4vh;">
                              <tr>
                                  <th style="width: 13vw;">TIME</th>
                                  <th style="width: 19vw;">AIRLINE</th>
                                  <th style="width: 14vw;">FLIGHT</th>
                                  <th style="width: 25vw; "><spam >FROM</spam></th>
                                  <th style="width: 13vw;">ARRIVAL</th>
                                  <th style="width: 16vw;">REMARKS</th>
                              </tr>
                          </thead>
                          <tbody>
                            <template v-for="(flight, index) in pagedGroups" :key="flight.flight + '-' + index">
                              <!-- Nếu là dòng thông báo ngày -->
                              <tr v-if="flight.isDaybreak" class="sizerow notice-row" style="height: 11vh;">
                                <td colspan="6" style="vertical-align: middle;">
                                  <div class="notice-content">{{ formatDateToFlightMessage(flight.date) }}</div>
                                </td>
                              </tr>

                              <!-- Nếu là chuyến bay -->
                              <tr v-else-if="flight.flight" class="sizerow85">
                                <td class="midal">{{ formatTime(flight.schedule) }}</td>
                                <td class="midal">
                                  <AirlineLogo :line-code="flight.lineCode" />
                                </td>
                                <td class="midal">{{ flight.flight }}</td>
                                <td class="midal1">{{ getFullCityName(flight.city) }}</td>
                                <td class="midal">{{ formatTime(flight.estimated || flight.schedule) }}</td>
                                <td class="midal" :class="flight.remark == 'Arrived' ? 'green' : flight.remark == 'Cancelled' ? 'red' : flight.remark == 'Delayed' ? 'yellow' : ''">
                                  {{ flight.remark }}
                                </td>
                              </tr>
                            </template>
                          </tbody>
                      </table>
                  </div>
          </div >
    </section>
    <HomeAppFooter85 /> 
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { parse, format } from 'date-fns'
  import { watch, reactive, toRefs } from 'vue';
  const currentIndex = ref(0);

  const config = useRuntimeConfig()

  const intervalId = ref<ReturnType<typeof setInterval> | null>(null);
  const countries = reactive({
    cityMap: [
        {codeAirport: "BHY",nameAirport: "Beihai",countries: "Trung Quốc"},
        {codeAirport: "ICN",nameAirport: "Incheon",countries: "Hàn Quốc"}
    ]});

  interface Flight {
    id: string;scheduledDate: string;schedule: string;estimated: string;
    actual: string;lineCode: string;flight: string;city: string;belt: string;remark: string;
  };
const flights = ref<Flight[]>([]);

const pagedGroupsData = ref<any[][]>([])
const currentPage = ref(0)
let pageSize = 10
let maxPages = 1
let pageInterval = 300
let reloadInterval = 180000 // 3 phút

async function loadFlights(rollOn: number, rollOff: number) {

  flights.value = await refetchDataArr(rollOn, rollOff);
  const allFlights = groupFlightsByDayWithBreak(flights.value)
  pagedGroupsData.value = paginateFlights(allFlights)
  if (currentPage.value >= pagedGroupsData.value.length) {
    currentPage.value = 0;
  }
}
  
const loadCityMap = async () => {
    fetch(`${config.public.apiBase}/Countries`) 
          .then(response => response.json())
          .then(data => {
            countries.cityMap = data;
          })
          .catch(error => {
          console.error(error);
          });
};

const refetchDataArr = async (rollOn: number,  rollOff: number): Promise<Flight[]> =>
  {
  const { data, error } = await useFetch<Flight[]>('/FidsArrivals', {
    baseURL: `${config.public.apiBase}`,
    method: 'GET',
    query: { rollOn, rollOff}
  });
  if (error.value) {
    console.error('❌ API Error:', error.value)
    return []
  }
  return data.value ?? []
}


function groupFlightsByDayWithBreak(flights: Flight[]) {
  const result: any[] = []
  let currentDay = flights[0]?.scheduledDate ?? ''
  flights.forEach((flight) => {
    const dateKey = flight.scheduledDate;
    if (dateKey !== currentDay) {
      result.push({ isDaybreak: true, date: dateKey })
      currentDay = dateKey
    }
    result.push({ ...flight, isDaybreak: false, date: dateKey })
  })
  return result
};

function paginateFlights(flightList: any[]) {
  const pages: any[][] = []
  let currentPage: any[] = []
  let rowCount = 0

  for (const item of flightList) {
    const linesNeeded = item.isDaybreak ? 2 : 1

    if (rowCount + linesNeeded > pageSize) {
      pages.push(currentPage)
      if (pages.length >= maxPages) break
      currentPage = []
      rowCount = 0
    }

    currentPage.push(item)
    rowCount += linesNeeded
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
};


const getFullCityName = (shortCode: string): string => {
  const airport = countries.cityMap.find(a => a.codeAirport === shortCode)
      return  airport ? airport.nameAirport : 'Not Found'
};

const formatTime = (datetime:string) :string => {
    if(datetime != "")
    {
        const date = parse(datetime, 'dd/MM/yyyy h:mm:ss a', new Date());
        if (isNaN(date.getTime())) {
            throw new Error('Invalid datetime format'+ datetime);
        }
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    else
    {
        return "";
    }
};
  
const formatDateToFlightMessage = (dateString: string): string => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }
    const dayOfWeek = daysOfWeek[date.getDay()] ?? ''
    const month     = months[date.getMonth()] ?? ''
    const day = date.getDate();
    const year = date.getFullYear();
    return `FLIGHTS FOR ${dayOfWeek.toUpperCase()} ${month.toUpperCase()} ${day}, ${year}`;
};


interface ConfigDevice 
{ id: number; name: string; location: string; description: string; ip: string;  rollOn: number;  
rollOff: number;  pageSize: number;  maxPages: number;  pageInterval: number; reloadInterval: number; 
mobilities: string; connectionId: string}

const configs = reactive<{configDevice: ConfigDevice;}>
({configDevice: {id: 1, name: "", location: "", description: "", 
ip: "", rollOn: 0, rollOff: 0, pageSize: 8, maxPages: 1, 
pageInterval:0, reloadInterval:0, mobilities: "",connectionId:""}})


const loadconfig = async () => {
  try {
    const response = await fetch(`${config.public.apiBase}/FidsInformation`);
    const data = await response.json();
    configs.configDevice = data;
  } catch (error) {
    console.error("Failed to load config: ", error);
  }
};

const intervalLoadFlights = ref<ReturnType<typeof setInterval> | null>(null);
const intervalLoadConfig  = ref<ReturnType<typeof setInterval> | null>(null);
const { loadAll, startPolling, stopPolling } = useAirlineLogos('FIDs')
onMounted(async () => {
  await loadAll()
  startPolling()
  await loadconfig()
  pageSize = configs.configDevice.pageSize;
  maxPages = configs.configDevice.maxPages;
  pageInterval = configs.configDevice.pageInterval;
  reloadInterval = configs.configDevice.reloadInterval;
  await loadFlights(configs.configDevice.rollOn, configs.configDevice.rollOff)
  autoRotatePages()
  intervalLoadFlights.value = setInterval(async () => 
    {
      await loadFlights(configs.configDevice.rollOn, configs.configDevice.rollOff)
    }, reloadInterval);
  intervalLoadConfig.value = setInterval(async () => 
  {
    await loadconfig()
  }, 600010);
})

function autoRotatePages() {
  setInterval(() => {
    currentPage.value = (currentPage.value + 1) % pagedGroupsData.value.length
  }, pageInterval)
}

const pagedGroups = computed(() => {
  const pageCount = pagedGroupsData.value.length;
  if (currentPage.value >= pageCount) {
    currentPage.value = 0;
  }
  return pagedGroupsData.value[currentPage.value]
});


onUnmounted(() => {
  stopPolling()
  if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
  }
  if (intervalLoadFlights.value) {
    clearInterval(intervalLoadFlights.value);
    intervalLoadFlights.value = null;
  }
  if (intervalLoadConfig.value) {
    clearInterval(intervalLoadConfig.value);
    intervalLoadConfig.value = null;
  }
  });

onBeforeMount(() => {
  loadCityMap();
});


</script>
  
  <style>
  @import url("~/assets/css/icheck.css");
  body {
      text-align: center !important;
      overflow: hidden;
      background-color: #283b92;
  }
  .card-body {
      padding: 0rem !important;
  }
  
.sizerow85 {
    height: 5.5vh;
    color: white;
    font-size: 2vh;
}
.midal {
  vertical-align: middle !important;

}
.midal1 {
  vertical-align: middle !important;
  text-align: left !important; /* Căn chữ về bên trái */
  padding-left: 1.5vw !important;
}

  
  .classtheadheader th {
      height: 4.5vh;
      color: #121542;
      font-size: 1.7vh;
      padding: 10px !important;
      text-align: center;
      vertical-align: middle !important;
  }

  
  .sizerow85:nth-child(odd) {
      background-color: #121441; /* Màu nền cho hàng lẻ */
  }
  
  .sizerow85:nth-child(even) {
      background-color: #283b92; /* Màu nền cho hàng chẵn */
  }
  .table td, .table th {
      padding: 0.25rem;
      border-top: 0px solid #dee2e6 !important;
  }

  td img {
    text-align: center !important;
    margin: 0vh;
    width: 100%;
    display: flex;
  }
  
.notice-content {
  font-weight: bold;
  font-size: 3vh;
  color: white;
}
  




  td.green {
    color: #07e207;
  }
  td.red {
    color: red;
  }
  td.yellow {
    color: yellow;
  }
  
  
  </style>