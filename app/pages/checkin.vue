<template>
    <div>
         <!-- Mode ưu tiên -->
        <div v-if="Model" class="Model">
          <div v-if="isOnTime" class="isOnTime">
            <div v-if="Nomal" style="" class="Nomal">
              <img alt="Vuelogo" :src="showImghafl" @error="handleImageError2"
              style="overflow: hidden; max-width: 100vw;height: 44.5vh; background-color: #244093;"/>
              <div class="noidungtext" style="background-color: #244093; max-width: 100vw;height: 55.5vh;">
                <span>{{ destination }}</span>
                <div class="flightTime">
                  <span>{{ flight }}</span>
                  <span>{{ time }}</span>
                </div>
              </div>
            </div>
            <div v-else class="!Nomal">
              <img alt="Vuelogo" :src="showImg" @error="handleImageError"
              style="overflow: hidden; max-width: 100vw;height: auto;"/>
            </div>
          </div>
          <div v-else class="!isOnTime">
            <img alt="Vuelogo" :src="`/img/fullscreen/${images[currentIndex]}?timestamp=${new Date().getTime()}`" class="slideshow-image" />
          </div>
        </div>
        <!-- End Mode ưu tiên -->
        <div v-else class="!Model">
          <img v-if="isManual" alt="Vuelogo" :src="`/img/fullscreen/${images[currentIndex]}?timestamp=${new Date().getTime()}`" class="slideshow-image"/>
          <img v-else alt="VuelogoManual" :src="showImgManual" class="slideshow-image" @error="handleImageError" />
        </div>
    </div>
</template>
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import * as signalR from "@microsoft/signalr";
  const config = useRuntimeConfig()
  const Model = ref(false);
  const Nomal = ref(true);
  const isOnTime = ref(true);
  const isManual = ref(true);
  const showImgManual = ref("");
  const showImg = ref("");
  const showImghafl = ref("");
  const destination = ref("");
  const flight = ref("");
  const time = ref("");
  const nameCounter = ref<string | null>(null);
  const location = ref<string | null>(null);
  let timeClose = ref<Date | null>(null);
  let timeStart = ref<Date | null>(null);

 
  // const urlCountries = 'http://172.17.18.12:8085/api/Countries';
  // const urlHub = 'http://172.17.18.12:8084/dashboardHub';

   const urlHub = config.public.urlHub;
   const urlCountries = `${config.public.apiBase}/Countries`;
   

// Danh sách ảnh (cập nhật nếu có ảnh mới)
const images = ref<string[]>([
  "AHT1.png",
  "AHT2.png",
  "AHT3.png",
  "AHT4.png"
]);

const countries = reactive({
  cityMap: [
      {codeAirport: "BHY",nameAirport: "Beihai",countries: "Trung Quốc"},
      {codeAirport: "ICN",nameAirport: "Incheon",countries: "Hàn Quốc"}
  ]});

const currentIndex = ref<number>(0);
let intervalIdaht = ref<number | null>(null);
const changeImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
};


// ─── Image helpers ────────────────────────────────────────────────────────────

// Parse comma-separated image values (full URL or local filename) into array of resolved srcs
const parseImgs = (raw: string | null | undefined, folder: string, fallback: string): string[] => {
  if (!raw || raw === 'null' || raw.trim() === '') return [`/img/${folder}/${fallback}`];
  return raw.split(',').map(s => {
    const v = s.trim();
    return v.startsWith('http') ? v : `/img/${folder}/${v}`;
  }).filter(Boolean);
};

// Per-field image arrays and current index for multi-image rotation
const nomalImgs  = ref<string[]>([]);
const ecoImgs    = ref<string[]>([]);
const busImgs    = ref<string[]>([]);
const manualImgs = ref<string[]>([]);

let imgRotateId: number | null = null;
let currentMode = '';

const stopImgRotation = () => {
  if (imgRotateId !== null) { clearInterval(imgRotateId); imgRotateId = null; }
};

const startImgRotation = (mode: string) => {
  stopImgRotation();
  currentMode = mode;
  let ni = 0, ei = 0, bi = 0, mi = 0;
  showImghafl.value  = nomalImgs.value[0]  ?? '';
  showImg.value      = (mode === 'Eco' ? ecoImgs.value : busImgs.value)[0] ?? '';
  showImgManual.value = manualImgs.value[0] ?? '';

  imgRotateId = window.setInterval(() => {
    if (nomalImgs.value.length > 1) {
      ni = (ni + 1) % nomalImgs.value.length;
      showImghafl.value = nomalImgs.value[ni];
    }
    const modeImgs = currentMode === 'Eco' ? ecoImgs.value : busImgs.value;
    if (modeImgs.length > 1) {
      if (currentMode === 'Eco') { ei = (ei + 1) % modeImgs.length; }
      else                       { bi = (bi + 1) % modeImgs.length; }
      showImg.value = currentMode === 'Eco' ? ecoImgs.value[ei] : busImgs.value[bi];
    }
    if (manualImgs.value.length > 1) {
      mi = (mi + 1) % manualImgs.value.length;
      showImgManual.value = manualImgs.value[mi];
    }
  }, 5000);
};

// ─── SignalR ──────────────────────────────────────────────────────────────────

const hubConnection = ref<signalR.HubConnection | null>(null);
const connectHub = async () => {
  hubConnection.value = new signalR.HubConnectionBuilder()
      .withUrl(urlHub)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

  hubConnection.value.onreconnected(() => { receiverUpdate(); });
  hubConnection.value.onclose(() => { startInterval(); });

  receiverUpdate(); // register BEFORE start() — OnConnectedAsync fires immediately on connect

  try {
    await hubConnection.value.start();
  } catch (err) {
    console.error('SignalR Connection failed to start:', err);
    startInterval();
  }
};

const receiverUpdate = () => {
  hubConnection.value!.off("SendToClient");
  hubConnection.value!.on("SendToClient", (data: any) => {
    timeStart.value = new Date(`${data.openTime}`);
    timeClose.value = new Date(`${data.closeTime}`);
    destination.value = getFullCityName(`${data.setImg}`);
    flight.value      = `${data.flight}`;
    time.value        = formattedTime(`${data.timeMcdt}`);
    nameCounter.value = `${data.name}`;
    location.value    = `${data.location}`;

    const now = new Date();
    isManual.value  = data.auto !== "False";
    isOnTime.value  = now > timeStart.value && now < timeClose.value;
    Nomal.value     = data.mode === "Nomal" && isOnTime.value;
    Model.value     = data.auto !== "False" && now >= timeStart.value;

    const f1080 = `${data.autoImg}_1920x1080.png`;
    const f480  = `${data.autoImg}_1920x480.png`;

    nomalImgs.value  = parseImgs(data.nomal,  '1920x480',  f480);
    ecoImgs.value    = parseImgs(data.eco,    'fullscreen', f1080);
    busImgs.value    = parseImgs(data.bus,    'fullscreen', f1080);
    manualImgs.value = parseImgs(data.manual, 'fullscreen', f1080);

    startImgRotation(data.mode ?? '');
    startCheckingFlights();
  });
};

const formattedTime = (bien: string) => {
  const date = new Date(bien);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const loadCityMap = async () => {
  fetch(urlCountries)
    .then(response => response.json())
    .then(data => {
      countries.cityMap = data;
    })
    .catch(error => {
      console.error(error);
    });
};
  
const getFullCityName = (shortCode: string): string => {
  const airport = countries.cityMap.find(a => a.codeAirport === shortCode)
      return  airport ? airport.nameAirport : 'Not Found'
};

const handleImageError = () => {
  showImg.value = '/img/fullscreen/AHT_1920x1080.png';
};

const handleImageError2 = () => {
  showImghafl.value = '/img/1920x480/Logo_1920x480.png';
};

// Kiểm tra thời gian hiện tại > CloseTime
const checkFlightsAndDelete = () => {
  if (!timeClose.value || !timeStart.value) {
    return;
  }
  const currentTime = new Date();
  const closeTime = timeClose.value;
  const startTime = timeStart.value;
  if (currentTime > closeTime) {
    if (hubConnection.value) {
      hubConnection.value
        .invoke("DeleteFlightFromClient", nameCounter.value ,location.value) 
        .then((result: boolean) => { // Nhận kết quả từ server
          if (result) {
            stopCheckingFlights();
          }
        })
        .catch((err) => {
          console.error("Error sending delete request:", err);
        });
    } else {console.error("SignalR connection is not established.");}
  }else
  {
    if(currentTime < startTime)
    {
      isOnTime.value = false;
    }else
    {
      isOnTime.value =true;
      Model.value = isManual.value == false ? false : true;
    }
  }
};
const intervalId1 = ref<number | null>(null);
const startCheckingFlights = () => {
  if (intervalId1.value !== null) {
    clearInterval(intervalId1.value);
  }
  intervalId1.value = window.setInterval(() => {
    checkFlightsAndDelete();
  }, 30000); // 60000ms = 1 phút
};
// Hàm dừng kiểm tra
const stopCheckingFlights = () => {
  if (intervalId1.value !== null) {
    clearInterval(intervalId1.value);
    intervalId1.value = null;
  }
};

const intervalId = ref<number | null>(null);
const reconnectHub = async () => {
  try {
    if (hubConnection.value) {
      try { await hubConnection.value.stop() } catch {}
    }
    await connectHub()  // ← rebuild hoàn toàn
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  } catch (err) {
    console.error('[Checkin] Manual reconnect failed:', err)
  }
}

const startInterval = () => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }
  intervalId.value = window.setInterval(() => {
    reconnectHub();
  }, 30000); // 30 seconds
    };


onMounted(async () => {
  if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
  }
  await connectHub();
  loadCityMap();
  intervalIdaht.value = window.setInterval(changeImage, 15000);
});

onUnmounted(() => {
  stopCheckingFlights();
  stopImgRotation();
  if (intervalId.value !== null) clearInterval(intervalId.value);
  if (intervalIdaht.value !== null) clearInterval(intervalIdaht.value);
  hubConnection.value?.stop();
});
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
  