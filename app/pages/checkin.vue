<template>
    <div>
         <!-- Mode ưu tiên -->
        <div v-if="Model" class="Model"> 
          <div v-if="isOnTime" class="isOnTime">
            <div v-if="Nomal" style="" class="Nomal">
              <img alt="Vuelogo" :src="`/img/1920x480/${showImghafl}?timestamp=${new Date().getTime()}`" @error="handleImageError2(showImghafl)" 
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
              <img alt="Vuelogo" :src="`/img/fullscreen/${showImg}?timestamp=${new Date().getTime()}`" @error="handleImageError(showImg)" 
              style="overflow: hidden; max-width: 100vw;height: auto;"/>
            </div>
          </div>
          <div v-else class="!isOnTime">
            <img  alt="Vuelogo" :src="`/img/fullscreen/${images[currentIndex]}?timestamp=${new Date().getTime()}`"class="slideshow-image" />
          </div>
        </div>
        <!-- End Mode ưu tiên -->
        <div v-else class="!Model">
          <img v-if="isManual" alt="Vuelogo" :src="`/img/fullscreen/${images[currentIndex]}?timestamp=${new Date().getTime()}`"class="slideshow-image"/>
          <img v-else alt="VuelogoManual" :src="`/img/fullscreen/${showImgManual}?timestamp=${new Date().getTime()}`"class="slideshow-image" @error="handleImageError(showImgManual)" />
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


const hubConnection = ref<signalR.HubConnection | null>(null);
const connectHub = async () => {
  const url = urlHub;
  hubConnection.value = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .configureLogging(signalR.LogLevel.Information)
      .build();
    try {
      await hubConnection.value.start();
      receiverUpdate();
    } catch (err) {
      console.error('SignalR Connection failed to start:', err);
      startInterval(); // Khởi động lại kết nối nếu có lỗi
    }
  hubConnection.value.onclose(() => {
      startInterval();
    });
};

const receiverUpdate= () => {
{
    // Lắng nghe sự kiện "SendToClient" từ server
    hubConnection.value!.off("SendToClient"); // <-- gỡ cũ trước
    hubConnection.value!.on("SendToClient", (data: any) => {
        timeStart.value = new Date(`${data.openTime}`);
        timeClose.value = new Date(`${data.closeTime}`);
        destination.value = getFullCityName(`${data.setImg}`);
        flight.value = `${data.flight}`;
        time.value = formattedTime(`${data.timeMcdt}`);
        nameCounter.value = `${data.name}`;
        location.value = `${data.location}`;
        isManual.value = data.auto === "False" ? false : true;
        Model.value = data.auto === "False" || new Date() < timeStart.value ? false : true;
        Nomal.value = data.mode === "Nomal" &&  new Date() < timeClose.value &&  new Date() > timeStart.value ? true : false;
        isOnTime.value = new Date() < timeClose.value &&  new Date() > timeStart.value ? true : false;
        showImg.value = data.mode === "Eco"
        ? (!data.eco ? `${data.autoImg}_1920x1080.png` : `${data.eco}`)
        : (!data.bus ? `${data.autoImg}_1920x1080.png` : `${data.bus}`);
        showImgManual.value = !data.manual ? `${data.autoImg}_1920x1080.png` : `${data.manual}`;
        showImghafl.value = !data.nomal || data.nomal === 'null' ? `${data.autoImg}_1920x480.png` : data.nomal
        startCheckingFlights();
    });
}
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

const handleImageError = (item: string) => {
  showImg.value = 'AHT_1920x1080.png';
};

const handleImageError2 = (item: string) => {
   showImghafl.value = 'Logo_1920x480.png';
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
        .then((result) => { // Nhận kết quả từ server
          if (result) {
            //stopCheckingFlights();
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
    await hubConnection.value?.start();
    receiverUpdate();
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  } catch (err) {
    console.error("SignalR reconnection failed:", err);
  }
};

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
    if (intervalId.value) clearInterval(intervalId.value);
    if (hubConnection.value) 
    {
      hubConnection.value.stop().then(() => {});
    }
    if (intervalIdaht.value !== null) 
    {
      clearInterval(intervalIdaht.value)
      intervalIdaht.value = null
    }

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
  