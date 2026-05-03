<template>
   <div class="body">
        <div class="hearder">
            <a><img class="logoaht" :src="`/logos/banner.png?timestamp=${new Date().getTime()}`" alt="" title=""></a>
        </div>
        <div class="mainbody">
            <div class="checkina" style="background-color: #121441;">
                <table class="table table-hover" style="margin-bottom: 0rem !important">
                    <thead class="theadheader hightrow " style="background-color: #36c0c7;">
                        <tr class="colortext">
                            <th :class="displayLanguage.language" style="width: 7%;"></th>
                            <th :class="displayLanguage.language" style="width: 20%;">{{displayLanguage.time}}</th>
                            <th :class="displayLanguage.language" style="width: 30%;">{{displayLanguage.airline}}</th>
                            <th :class="displayLanguage.language" style="width: 24%;">{{displayLanguage.flight}}</th>
                            <th :class="displayLanguage.language" style="width: 20%;">{{displayLanguage.counter}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="sizerow" v-for="item in displayedFlightsA" :key="item.flight + item.lineCode">
                            <td>
                                <img :class="{ Hiden: Array.isArray(item.code) && item.code.length > 0 }"  alt="Vuelogo" :src="`/logos/DrecLeft.png?timestamp=${new Date().getTime()}`" @error="handleImageError(item)" />
                                <div :class="{ Hiden: !Array.isArray(item.code) || item.code.length === 0 } ">
                                    <RenLogo :msg="item.code"/> 
                                </div>
                            </td>
                            <td >{{ formatTime(item.schedule) }}</td>
                            <td>
                                <AirlineLogo :line-code="item.lineCode" location="FIDs" />
                            </td>
                            <td >
                                <div :class="{ Hiden: Array.isArray(item.code) && item.code.length > 0 }">{{ item.flight }}</div>
                                <div :class="{ Hiden: !Array.isArray(item.code) || item.code.length === 0 } ">
                                    <RenAirline :msg="item.code"/>
                                </div>
                            </td>
                            
                            <td >{{ item.rowFrom }} - {{ item.rowTo }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="checkinb" style="background-color: #121441;">
                <table class="table table-hover" style="margin-bottom: 0rem !important">
                    <thead class="theadheader hightrow " style="background-color: #36c0c7;">
                    <tr class="colortext">
                        <th :class="displayLanguage.language" style="width: 20%;">{{displayLanguage.time}}</th>
                        <th :class="displayLanguage.language" style="width: 29%;">{{displayLanguage.airline}}</th>
                        <th :class="displayLanguage.language" style="width: 23%;">{{displayLanguage.flight}}</th>
                        <th :class="displayLanguage.language" style="width: 21%;">{{displayLanguage.counter}}</th>
                        <th :class="displayLanguage.language" style="width: 7%;"></th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr class="sizerow" v-for="item in displayedFlightsB" :key="item.flight + item.lineCode">
                            <td >{{ formatTime(item.schedule) }}</td>
                            <td>
                                <AirlineLogo :line-code="item.lineCode" location="FIDs" />
                            </td>
                            <td >
                                <div :class="{ Hiden: Array.isArray(item.code) && item.code.length > 0 }">{{ item.flight }}</div>
                                <div :class="{ Hiden: !Array.isArray(item.code) || item.code.length === 0 } ">
                                    <RenAirline :msg="item.code"/>
                                </div>
                            </td>
                            
                            <td >{{ item.rowFrom }} - {{ item.rowTo }}</td>
                            <td>
                                <img :class="{ Hiden: Array.isArray(item.code) && item.code.length > 0 }"  alt="Vuelogo" :src="`/logos/DrecRight.png?timestamp=${new Date().getTime()}`" @error="handleImageError(item)" />
                                <div :class="{ Hiden: !Array.isArray(item.code) || item.code.length === 0 } ">
                                    <RenLogo :msg="item.code"/> 
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
   </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted } from 'vue';
    import { parse } from 'date-fns'
    import RenLogo from './RenLogo.vue';
    import RenAirline from './RenAirline.vue';
    
    const timeflopdisplaylanguage = 3;
    const timefresh = 65;

    // const urlEntranceA =`https://localhost:7079/api/EntranceCA`;
    // const urlEntranceB =`https://localhost:7079/api/EntranceCB`;

    const config = useRuntimeConfig()
    const { loadAll, startPolling, stopPolling } = useAirlineLogos('Stand')
    const urlEntranceA = `${config.public.apiBase}/EntranceCA`;
    const urlEntranceB = `${config.public.apiBase}/EntranceCB`;

    interface DisplayLanguage {
        language: string;
        title: string;
        airline: string;
        flight: string;
        time: string;
        counter: string;
    }

    const language =ref<DisplayLanguage[]>([
        {language: "ENG",title: "CHECK-IN WAIT TIMES", airline: "AIRLINE", flight: "FLIGHT", time:"STD", counter:"COUNTER" },
        {language: "VNE",title: "THỜI GIAN CHỜ LÀM THỦ TỤC", airline: "HÃNG BAY", flight: "CHUYẾN BAY", time:"THỜI GIAN", counter:"QUẦY" },
        {language: "HAN",title: "체크인 대기 시간", airline: "항공사", flight: "비행", time:"시간", counter:"카운터" },
        {language: "TRG",title: " 值机等待时间", airline: "航空公司", flight: "航班", time:"时间", counter:"柜台"},

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

    interface codeshare {
        LineCode :string; flight:string
    }
    interface Flight {
        lineCode: string;code:codeshare[]; flight: string; schedule: string;rowFrom: string; rowTo: string
    };
    const flightsA = ref<Flight[]>([]);
    const flightsB = ref<Flight[]>([]);

    const displayedFlightsA = computed(() => {
        const data = flightsA.value;
        if(data.length >0)
        {
            return data.slice(0, data.length);
        }
        return [];
    });

    const displayedFlightsB = computed(() => {
        const data = flightsB.value;
        if(data.length >0)
        {
            return data.slice(0, data.length);
        }
        return [];
    });

    const refetchData = () => {
        refetchDataA();
        refetchDataB();
    };
    const refetchDataA = () => {
        const url = urlEntranceA;
        fetch(url) 
            .then(response => response.json())
            .then(data => {
            if (Array.isArray(data)) { // Kiểm tra xem có phải là mảng không
                flightsA.value = data;
            } else {
                console.error("Invalid data format from API");
            }
            })
            .catch(error => {
            console.error("Error fetching data:", error);
            });
    };

    const refetchDataB = () => {
        const url = urlEntranceB;
        fetch(url) 
            .then(response => response.json())
            .then(data => {
            if (Array.isArray(data)) { // Kiểm tra xem có phải là mảng không
                flightsB.value = data;
            } else {
                console.error("Invalid data format from API");
            }
            })
            .catch(error => {
            console.error("Error fetching data:", error);
            });
    };

    function handleImageError(item: any) {
        item.airLine = 'trans'; 
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

    const intervalIdFresArr = ref<ReturnType<typeof setInterval> | null>(null);
    onMounted(async () => {
        await loadAll();
        startPolling();
        startIntervalIndexDisplay();
        refetchData();
        intervalIdFresArr.value = setInterval(refetchData, timefresh*1000);
    });

    onUnmounted(() => {
        stopPolling();
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
@import url("~/assets/css/fonttienghan.css");

* {
    box-sizing: border-box;
}

html,
body,
#__nuxt {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background-color: #050816;
}

.body {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #050816;
}

.hearder {
    width: 100vw;
    height: 13vh;
    /* flex: 0 0 14.8vh; */
    overflow: hidden;
    background: #ffffff;
}

.hearder a {
    display: block;
    width: 100%;
    height: 100%;
}

img.logoaht {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.mainbody {
    width: 100vw;
    height: 87vh;
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    gap: 0.35vw;
    padding: 0;
    background: #050816;
}

.checkina,
.checkinb {
    width: calc(50vw - 0.175vw);
    height: 100%;
    overflow: hidden;
    background-color: #121441 !important;
}

.table {
    width: 100%;
    height: 100%;
    margin-bottom: 0 !important;
    table-layout: fixed;
    border-collapse: collapse;
}

.table th,
.table td {
    border: 0 !important;
    text-align: center;
    vertical-align: middle !important;
    line-height: 1.05;
}

.table th {
    padding: 0.25vh 0.25vw !important;
    color: #121441;
    font-weight: 800;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.table td {
    padding: 0.35vh 0.35vw !important;
    color: #ffffff;
    font-size: clamp(24px, 3.65vh, 48px);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

thead.theadheader.hightrow,
tr.colortext {
    height: 8.7vh;
}

tr.colortext {
    font-size: clamp(18px, 2.8vh, 36px);
}

tr.sizerow {
    height: 8.7vh;
}

.sizerow:nth-child(odd) {
    background-color: #121441;
}

.sizerow:nth-child(even) {
    background-color: #283b92;
}

.table img,
.table :deep(img),
.table .Vuelogocl {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: 6.7vh;
    object-fit: contain;
    margin: 0 auto;
}

.table td:first-child,
.table td:last-child {
    padding-left: 0.15vw !important;
    padding-right: 0.15vw !important;
}

.Hiden {
    position: absolute;
    display: none;
}

th.HAN {
    font-family: 'tienghan' !important;
}
</style>