<template>
    <div class="waiting-a-page">
        <div class="waiting-a-header">
            <div class="waiting-a-check-in-header">
                <h1 :class="displayLanguage.language" style="color: white !important;">{{displayLanguage.title}}</h1>
                <div class="waiting-a-wait-times">
                    <div class="waiting-a-time-legend" :class="displayLanguage.language">
                        <span class="waiting-a-box waiting-a-box-grey"></span> <span>{{displayLanguage.wait05}}</span>
                    </div>
                    <div class="waiting-a-time-legend han" :class="displayLanguage.language">
                        <span class="waiting-a-box waiting-a-box-green"></span> <span>{{displayLanguage.wait510}}</span>
                    </div>
                    <div class="waiting-a-time-legend han" :class="displayLanguage.language">
                        <span class="waiting-a-box waiting-a-box-yellow"></span> <span>{{displayLanguage.wait1020}}</span>
                    </div>
                    <div class="waiting-a-time-legend han" :class="displayLanguage.language">
                        <span class="waiting-a-box waiting-a-box-red"></span> <span>{{displayLanguage.wait20}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="waiting-a-mainbody" style="background-color: red;">
            <div class="waiting-a-flightmain">
                <table class="waiting-a-table table-hover" style="margin-bottom: 0rem !important">
                    <thead class="waiting-a-theadheader waiting-a-hightrow " style="background-color: #36c0c7;">
                        <tr class="waiting-a-colortext">
                            <th :class="displayLanguage.language" style="width: 43%;">{{displayLanguage.airline}}</th>
                            <th :class="displayLanguage.language" style="width: 33%;">{{displayLanguage.flight}}</th>
                            <th :class="displayLanguage.language" style="width: 24%;">{{displayLanguage.time}}</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr class="waiting-a-sizerow" v-for="item in displayedFlights" :key="`${item.linecode}-${item.number}-${item.createdAt}`" >
                        <td><AirlineLogo :line-code="item.linecode" location="FIDs" /></td>
                        <td >{{ item.airline }}</td>
                        <td class="waiting-a-time-column" :data-status="item.maxWaitingTime < 11*60 ? (item.maxWaitingTime < 6*60 ? '0' :'short') :  (item.maxWaitingTime < 21*60 ? 'medium' : 'long')">
                            {{ Math.floor(item.maxWaitingTime / 60)  }}
                            <span class="waiting-a-triangle-indicator"></span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="waiting-a-clockmain">
                <div class="waiting-a-blocClock">
                    <div class="waiting-a-digital-clock">
                        {{ currentTime }}
                    </div>
                </div>
            </div>
        </div>
        <div class="waiting-a-footer"><span class="linkweb">www.danangairport.vn</span></div>
    </div>
    <button class="waiting-a-btnsw" @click="switchLanguage">Switch Language</button>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted } from 'vue';
    const currentIndex = ref(0);
    const rowsPerPage = 6;
    const specialIndex = ref(-1);
    const numberfloadArr = 2;
    const timeflopArr = 25;
    const timefresh = 65;
    const timeflopdisplaylanguage = 5;
    //const urlArr = `https://localhost:7079/api/ClockWaittingTimeFlight?name=a`;
    const config = useRuntimeConfig()
    const { loadAll, startPolling, stopPolling } = useAirlineLogos('FIDs')
    const urlArr = `${config.public.apiBase}/ClockWaittingTimeFlight?name=b`;
    interface Flight {
        areaName: string;airline: string;linecode: string;number: string; scheduleDate: string; maxWaitingTime: number
        departureTime: string;counterStart: string;counterEnd: string;createdAt: string
    };
    const flights = ref<Flight[]>([]);
    const currentTime = ref<string>("23:56"); 
    const clockInterval = ref<ReturnType<typeof setInterval> | null>(null);
    const rotateInterval = ref<ReturnType<typeof setInterval> | null>(null);
    function switchLanguage() {
       indexdisplay.value = (indexdisplay.value + 1) % language.value.length;
    }

    function updateTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    interface DisplayLanguage {
        language: string;
        title: string;
        airline: string;
        flight: string;
        time: string;
        wait05: string;
        wait510: string;
        wait1020: string;
        wait20: string;
    }

    const language =ref<DisplayLanguage[]>([
        {language: "ENG",title: "CHECK-IN WAIT TIMES", airline: "AIRLINE", flight: "FLIGHT", time:"TIME", wait05:"0-5 minutes",wait510:"5-10 minutes",wait1020:"10-20 minutes",wait20:">20 minutes" },
        {language: "VNE",title: "THỜI GIAN CHỜ LÀM THỦ TỤC", airline: "HÃNG BAY", flight: "CHUYẾN BAY", time:"THỜI GIAN", wait05:"0-5 Phút",wait510:"5-10 Phút",wait1020:"10-20 Phút",wait20:">20 Phút" },
        {language: "HAN",title: "체크인 대기 시간", airline: "항공사", flight: "비행", time:"시간", wait05:"0-5분",wait510:"5-10분",wait1020:"10-20분",wait20:">20분" },
        {language: "TRG",title: " 值机等待时间", airline: "航空公司", flight: "航班", time:"时间", wait05:"0-5 分钟",wait510:"5-10 分钟",wait1020:"10-20 分钟",wait20:"》20 分钟" },

    ]);
    const defaultLanguage: DisplayLanguage = language.value[0]!;
    const indexdisplay = ref(2); 
    const displayLanguage = computed<DisplayLanguage>(() => {
        return language.value[indexdisplay.value] ?? defaultLanguage; 
    });
    const updateIndexDisplay = () => {
        indexdisplay.value = indexdisplay.value +1;
        if (indexdisplay.value === 4) {indexdisplay.value = 0;}
    };
    const intervaldisplay = ref<ReturnType<typeof setInterval> | null>(null);
    function startIntervalIndexDisplay() {
        intervaldisplay.value = setInterval(updateIndexDisplay, timeflopdisplaylanguage*1000);
    };

    const displayedFlights = computed<Flight[]>(() => {
        const data = flights.value;
        if(data.length >0)
        {
            if (data.length > 0 && currentIndex.value < data.length && currentIndex.value >= 0) {
            return data.slice(currentIndex.value, currentIndex.value + rowsPerPage);
            } else {
            return [];
            }
        }
        return [];
    });

    const updateFlights = () => {
        currentIndex.value += rowsPerPage;
        if (flights.value.length <=6) {currentIndex.value = 0;}
        if (currentIndex.value >= numberfloadArr*6) {
        currentIndex.value = 0;
        specialIndex.value = -1;
        }
    };

    function startInterval() {
        rotateInterval.value = setInterval(updateFlights, timeflopArr*1000);
    };

    const refetchDataArr = () => {
        fetch(urlArr) 
            .then(response => response.json())
            .then(data => {
            if (Array.isArray(data)) { // Kiểm tra xem có phải là mảng không
                flights.value = data;
                //console.log("refetchDataArr ok!");
            } else {
                console.error("Invalid data format from API");
            }
            })
            .catch(error => {
            console.error("Error fetching data:", error);
            });
    };

    const intervalIdFresArr = ref<ReturnType<typeof setInterval> | null>(null);
    onMounted(async () => {
        await loadAll();
        startPolling();
        updateTime(); // Initial call to set the time immediately
        clockInterval.value = setInterval(updateTime, 1000);
        startInterval();
        startIntervalIndexDisplay();
        refetchDataArr();
        intervalIdFresArr.value = setInterval(refetchDataArr, timefresh*1000 - 100);
    });
    onUnmounted(() => {
        stopPolling();
        if (clockInterval.value) {
            clearInterval(clockInterval.value);
            clockInterval.value = null;
        }
        if (rotateInterval.value) {
            clearInterval(rotateInterval.value);
            rotateInterval.value = null;
        }
        if (intervaldisplay.value) {
            clearInterval(intervaldisplay.value);
            intervaldisplay.value = null;
        }
        if (intervalIdFresArr.value) {
            clearInterval(intervalIdFresArr.value);
            intervalIdFresArr.value = null;
        }
    });
</script>

<style>
@import url("~/assets/css/fontnumber.css");
@import url("~/assets/css/fonttienghan.css");
.waiting-a-page {
    display: flex;
    flex-direction: column;
    background-color: #0a0f3a;
    width: 22vw;
    height: 100vh;
}
.waiting-a-header {
    background-color: #0a0f3a;
    width: 100%;
    height: 11.2vh;
    margin-left: 2px;
    color: white;
    display: flex;
    align-items: center;
    text-align: center;
}
.waiting-a-check-in-header {
    width: 100%;
    margin-right: 2px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: stretch;
}
.waiting-a-mainbody {

    width: 100%;
    height: 45.14vh;
    margin-left: 2px;
}
.waiting-a-footer {
    background-color: #41c1c2;
    display: flex;
    height: 43.66vh;
    align-content: flex-start;
    justify-content: center;
    padding-top: 12px;

}

span.waiting-a-linkweb {
    color: #060606;
    font-size: 2.6vh;
}

.waiting-a-flightmain {
    background-color: #0a0f3a;
    width: 100%;
    height: 59%;
}
.waiting-a-clockmain {
    background-color: #0a0f3a;
    width: 100%;
    height: 41%;
}
.waiting-a-table th {
      padding: 0.15rem;
      border-top: 0px solid #dee2e6 !important;
      border-bottom: 0px solid #dee2e6 !important;
      color: #0a0f3a;
      text-align: center;
}
.waiting-a-theadheader th {
    color: #121542;
    font-size: 1.7vh;
    text-align: center;
    vertical-align: middle !important;
}
.waiting-a-table td img {
    text-align: center !important;
    margin: 0vh;
    width: 100%;
    display: flex;
    margin-left: -2px;
}
.waiting-a-table td {
    padding: 0.15rem;
    border-top: 0px solid #dee2e6 !important;
    border-bottom: 0px solid #dee2e6 !important;
    color: white;
    text-align: center;
}
.waiting-a-sizerow td {
    color: white;
    font-size: 2.9vh;
    vertical-align: middle;
    height: 3.5vh;
}
.waiting-a-sizerow:nth-child(odd) {
      background-color: #0a0f3a;
}
.waiting-a-sizerow:nth-child(even) {
    background-color: #283b92;
}
.waiting-a-hightrow {
    height: 3.4vh;
}
.waiting-a-triangle-indicator {
    position: absolute;
    right: 0.8vw;
    top: 42%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent; /* Left side of the triangle */
    border-right: 10px solid transparent; /* Right side of the triangle */
    border-top: 10px solid red; /* Triangle color */
}
.waiting-a-time-column {
    position: relative; /* Allows the triangle to be positioned relative to this cell */
    text-align: right !important;
    padding-right: 1.7vw !important;
}
/* Optional: Change triangle color dynamically based on data */
.waiting-a-time-column[data-status="0"] .waiting-a-triangle-indicator {
  border-top-color: white;
}
.waiting-a-time-column[data-status="short"] .waiting-a-triangle-indicator {
  border-top-color: green;
}

.waiting-a-time-column[data-status="medium"] .waiting-a-triangle-indicator {
  border-top-color: yellow;
}

.waiting-a-time-column[data-status="long"] .waiting-a-triangle-indicator {
  border-top-color: red;
}
.waiting-a-blocClock {
    display: flex;
    font-family: 'DigitalClock', sans-serif;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    align-content: center;
    color: white;
    font-size: 10vw;
  }
/* -------------------------------- */

table.waiting-a-table.table-hover {
    width: 100%;
}

.waiting-a-check-in-header h1 {
    font-size: 1.95vw;        /* Adjust font size */
    margin: 0;                /* Remove default margin */
    font-weight: bold;        /* Bold text */
    display: block;           /* Ensures the h1 behaves like a block element */
    width: 100%;              /* Forces the h1 to occupy the full width of the parent */
    text-align: center;       /* Center-aligns the text within the block */
    word-wrap: break-word;    /* Ensures text wraps correctly if needed */
    font-family: 'Roboto', sans-serif !important;
    padding-top: 10px;
}

.waiting-a-wait-times {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    gap: 10px;
}

.waiting-a-time-legend {
    display: flex;
    align-items: center;
    font-size: 0.6vw;
}

.waiting-a-box {
    width: 1.3vh;
    height: 1.3vh;
    border-radius: 2px;
    display: inline-block;
    margin-right: 5px;
}

.waiting-a-sizerow {
    line-height: 3.8vh;
}

/* Color boxes */
.waiting-a-box-grey {
  background-color: white; 
}
.waiting-a-box-green {
  background-color: green; 
}
.waiting-a-box-yellow {
  background-color: yellow;
}
.waiting-a-box-red {
  background-color: red; 
}

/*css language Han */
.waiting-a-time-legend.HAN {
    font-size: 1vw;
    font-family: 'tienghan' !important;
}
.waiting-a-check-in-header h1.HAN {
    font-size: 2.1vw;
    font-family: 'tienghan' !important;
}
.waiting-a-table th.HAN {
    font-size: 1.8vh;
    font-family: 'tienghan' !important;
}
/*css language Trung */
.waiting-a-check-in-header h1.TRG {
    font-size: 2.1vw;
    letter-spacing: 0.12em;
}
.waiting-a-time-legend.TRG {
    font-size: 0.9vw;
}
.waiting-a-table th.TRG {
    font-size: 1vw;
}
/*css language VNE */
.waiting-a-check-in-header h1.VNE {
    font-size: 1.44vw;
    letter-spacing: 0em;
}
.waiting-a-time-legend.VNE {
    font-size: 0.7vw;
}
.waiting-a-table th.VNE {
    font-size: 1.5vh;
}

button.waiting-a-btnsw {
    position: absolute;
    bottom: 30vh;
    left: 1vh;
}

span.linkweb {
    color: #000000;
    font-size: 2.5vh;
    margin-top: -1.3vh;
}
</style>