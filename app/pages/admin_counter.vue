<template>
  <section class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="card main" >
                <div class="card-body pad table-responsive" style="width: 73vw">
                    <table class="table table-hover tabmain" id="">
                        <thead class="theadheader" style="background-color: #31d2f2;">
                            <tr>
                                <th>Reload</th>
                                <th>Name</th>
                                <th>IpAddress</th>
                                <th>Location</th>
                                <th class="checkput">Status</th>
                                <th>Open</th>
                                <th>Close</th>
                                <th>Flight</th>
                                <th class="checkput">Nomal</th>
                                <th class="checkput">Eco</th>
                                <th class="checkput">Bus</th>
                                <th>Remark</th>
                                <th class="checkput">Auto</th>
                            </tr>
                        </thead>
                        <tbody >
                          <!-- Hiển thị dữ liệu -->
                          <tr v-for="item in responseData" @click="handleSetupClick(item)"
                          :key="item.id" style="font-weight: 500; font-size: larger;">
                            <td><i class="reloadgate fas fa-sync-alt" @click="handleReloadClick(item)" style="font-size: 15px;color:#0b1c60; margin-left: 19%;"></i></td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.ip }}</td>
                            <td>{{ item.location }}</td>
                            <td class="checkput"><i :class="{'fas fa-circle fa-lg': true, [item.connectionId != '' ? 'text-green':'text-gray']:true}"></i></td>
                            <td :class="{[item.connectionId != '' ? 'text-green':'text-gray']:true}">{{ convertToTimeOnly(item.openTime) }}</td>
                            <td :class="{[item.connectionId != '' ? 'text-green':'text-gray']:true}">{{ convertToTimeOnly(item.closeTime) }}</td>
                            <td :class="{[item.connectionId != '' ? 'text-green':'text-gray']:true}">{{ item.flight }}</td>
                            <!-- Radio buttons -->
                            <td  class="checkput" @click="updateMode(item, 'Nomal')">
                              <i :class="{'auto fa-2xl':true, [item.mode != 'Nomal' ? 'far fa-circle':'fas fa-dot-circle']:true,   [item.name]:true}" style="font-size: x-large;color:#0b1c60"></i>
                            </td>
                            <td  class="checkput" @click="updateMode(item, 'Eco')">
                              <i :class="{'auto fa-2xl':true, [item.mode != 'Eco' ? 'far fa-circle':'fas fa-dot-circle']:true,   [item.name]:true}" style="font-size: x-large;color:#0b1c60"></i>
                            </td>
                            <td  class="checkput" @click="updateMode(item, 'Bus')">
                              <i :class="{'auto fa-2xl':true, [item.mode != 'Bus' ? 'far fa-circle':'fas fa-dot-circle']:true,   [item.name]:true}" style="font-size: x-large;color:#0b1c60"></i>
                            </td>
                            <td :class="{[item.connectionId != '' ? 'text-green':'text-gray']:true}">{{ item.status }}</td>
                            <td class="checkput" @click="updateAuto(item)" >
                              <i :class="{'auto fas fa-2xl':true, [item.auto != 'True' ? 'fa-toggle-off':'fa-toggle-on']:true,   [item.name]:true}" style="font-size: x-large;color:#0b1c60"></i>
                            </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- /.card -->
                <div :class="{ shrink: isScrolled }" class="card-body pad table-responsive poisionfid" style="width: 27vw">
                  <table class="table table-hover" id="">
                      <thead class="theadheader" style="background-color: #31d2f2;">
                          <tr>
                              <th>Set Image</th>
                              <th>{{ responseDataFlight.name || '' }}</th>
                          </tr>
                      </thead>
                        <tbody >

                        </tbody>
                  </table>
                  <!-- Hiển thị dữ liệu -->
                  <div class="container">
                  <!-- Row: Nomal -->
                    <div class="row">
                      <span class="label">Nomal:</span>
                      <span class="value">{{ responseDataFlight.nomal || 'Loading...' }}</span>
                      <i class="fas fa-images icon" @click="toggleSelectNomal"></i>
                    </div>
                    <div class="row" v-if="isNomalVisible">
                      <!-- Select multiple-->
                      <div class="form-group" style="width: 100%;">
                        <select multiple class="custom-select" v-model="selectedOptionsNomal" style="height: 200px !important;">
                          <option v-for="(item, index) in responseFileNameForNomal" :key="index" :value="item">
                            {{ item }}
                          </option>
                        </select>
                      </div>
                      <div style="display: flex !important; justify-content: space-between !important; width: 100%;">
                        <span for="">{{ selectedOptionsNomal.toString() }}</span>
                        <i class="fas fa-upload icon" @click="SelectNomal(selectedOptionsNomal.toString())"></i>
                      </div>
                    </div>
                    <!-- Row: Economy -->
                    <div class="row">
                      <span class="label">Economy:</span>
                      <span class="value">{{ responseDataFlight.eco || 'Loading...' }}</span>
                      <i class="fas fa-images icon" @click="toggleSelectEco"></i>
                    </div>
                    <div class="row" v-if="isEcoVisible">
                      <!-- Select multiple-->
                      <div class="form-group" style="width: 100%;">
                        <select multiple class="custom-select" v-model="selectedOptionsEco" style="height: 200px !important;">
                          <option v-for="(item, index) in responseFileName" :key="index" :value="item">
                            {{ item }}
                          </option>
                        </select>
                      </div>
                      <div style="display: flex !important; justify-content: space-between !important; width: 100%;">
                        <span for="">{{ selectedOptionsEco.toString() }}</span>
                        <i class="fas fa-upload icon" @click="SelectEco(selectedOptionsEco.toString())"></i>
                      </div>
                      
                    </div>
                    <!-- Row: Businees -->
                    <div class="row">
                      <span class="label">Businees:</span>
                      <span class="value">{{ responseDataFlight.bus || 'Loading...' }}</span>
                      <i class="fas fa-images icon" @click="toggleSelectBus"></i>
                    </div>
                    <div class="row" v-if="isBusVisible">
                      <!-- Select multiple-->
                      <div class="form-group" style="width: 100%;">
                        <select multiple class="custom-select" v-model="selectedOptionsBus" style="height: 200px !important;">
                          <option v-for="(item, index) in responseFileName" :key="index" :value="item">
                            {{ item }}
                          </option>
                        </select>
                      </div>
                      <div style="display: flex !important; justify-content: space-between !important; width: 100%;">
                        <span for="">{{ selectedOptionsBus.toString() }}</span>
                        <i class="fas fa-upload icon" @click="SelectBus(selectedOptionsBus.toString())"></i>
                      </div>
                    </div>
                    <!-- Row: Set Manual -->
                    <div class="row">
                      <span class="label">Set Manual:</span>
                      <span class="value">{{ responseDataFlight.manual || 'Loading...' }}</span>
                      <i class="fas fa-images icon" @click="toggleSelectManual"></i>
                    </div>
                    <div class="row" v-if="isManualVisible">
                      <!-- Select multiple-->
                      <div class="form-group" style="width: 100%;">
                        <select multiple class="custom-select" v-model="selectedOptionsManual" style="height: 200px !important;">
                          <option v-for="(item, index) in responseFileName" :key="index" :value="item">
                            {{ item }}
                          </option>
                        </select>
                      </div>
                      <div style="display: flex !important; justify-content: space-between !important; width: 100%;">
                        <span for="">{{ selectedOptionsManual.toString() }}</span>
                        <i class="fas fa-upload icon" @click="SelectManual(selectedOptionsManual.toString())"></i>
                      </div>
                    </div>
                  </div>
                  <!---->
                  <div class="row">
                        <div class="col-12" style="margin-top: 10px;">
                        <!-- split buttons box -->
                        <div class="card">
                                <div class="card-header" style="    height: 42px;margin-top: -4px;background-color: #31d2f2;">
                                    <h3 class="card-title" style="font-weight: bold;">Airline Code</h3>
                                    <div class="card-tools">
                                        <div class="input-group input-group-sm" style="width: 150px;">
                                            <input type="text" v-model="inputValueLineCode" name="table_search" class="form-control float-right" placeholder="Search">
                                            <div class="input-group-append">
                                            <button type="submit" class="btn btn-default" @click="handleCheckLineCodeClick()">
                                                <i class="fas fa-search"></i>
                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body maindtth">
                                 <div class="lineCode" v-for="item in responseLineCode" @click="handleLineCodeClick(item.name)">{{item.name}}</div>
                                </div>
                            <!-- /.card-body -->
                           </div>
                        </div>
                    </div>
                    <!--End-->
                </div>
              <!-- /.card -->
              </div>
            </div>
        </div>
</section>
</template>

<script setup lang="ts">
//import { format } from 'date-fns';
import * as signalR from "@microsoft/signalr";
import { areIntervalsOverlappingWithOptions } from "date-fns/fp";
import { ref, onMounted } from 'vue';

//const urlHub = 'http://172.17.18.12:8084/dashboardHub';
const urlHub = 'https://localhost:7248/dashboardHub';
const Mode =ref("Nomal");
const selectedOptionsNomal = ref("");
const selectedOptionsEco = ref("");
const selectedOptionsBus = ref("");
const selectedOptionsManual = ref("");
const inputValueLineCode =ref("");
interface ResponseItem {
  id: string;
  name: string;
  ip: string;
  location: string;
  openTime: Date;
  closeTime: Date;
  flight: string;
  status: string;
  mode:string;
  auto: string;
  ImageName: string;
  Nomal: string;
  Eco: string;
  Bus: string;
  Manual: string;
  connectionId: string;
}

const responseData = ref<ResponseItem[]>([]); // Khai báo kiểu cho responseData

// Hàm toggle note "Items Sale"
const isNomalVisible = ref(false);
const toggleSelectNomal = () => {
  isNomalVisible.value = !isNomalVisible.value;
};
const isEcoVisible = ref(false);
const toggleSelectEco = () => {
  isEcoVisible.value = !isEcoVisible.value;
};
const isBusVisible = ref(false);
const toggleSelectBus = () => {
  isBusVisible.value = !isBusVisible.value;
};
const isManualVisible = ref(false);
const toggleSelectManual = () => {
  isManualVisible.value = !isManualVisible.value;
};

interface ResponseItemFlight {
  name: string;
  nomal: string;
  eco: string;
  bus: string;
  manual: string;
}
const responseDataFlight = ref<ResponseItemFlight>({
  name: "",
  nomal: "",
  eco: "",
  bus: "",
  manual: "",
});

interface linecode {
  name: string;
  nomal: string;
  eco: string;
  bus: string;
  manual: string;
}
// Khai báo `responseDataFlight` là một đối tượng hoặc null
const responseLineCode = ref<linecode[]>([]); 

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY >= 20;
};

const loadlinecode = () =>{
      const headers = new Headers();
      headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.append('Pragma', 'no-cache');
      headers.append('Expires', '0');
      fetch('https://localhost:7079/api/ImageForFlight') 
      //fetch('http://172.17.18.12:8085/api/ImageForFlight')
      .then(response => response.json())
      .then(data => {
        responseLineCode.value = data;
      })
      .catch(error => {
        console.error(error);
      });
}

const fetchDataLineCode = (name:string) => {
  const headers = new Headers();
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');
  fetch(`https://localhost:7079/api/ImageForFlight/${name}`)
  //fetch(`http://172.17.18.12:8085/api/ImageForFlight/${name}`)
  .then(response => {
    // Kiểm tra mã trạng thái HTTP
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Kiểm tra phản hồi không rỗng
    if (response.headers.get("content-length") === "0") {
      throw new Error("Empty response from server");
    }

    // Parse JSON
    return response.json();
  })
  .then(data => {
    console.log("Server response:", data);
    responseDataFlight.value = data; // Lưu phản hồi vào biến
  })
  .catch(error => {
    console.error("Fetch error: ", error);
  });

};

const handleCheckLineCodeClick = () => {
  console.log(inputValueLineCode.value);
  if(inputValueLineCode.value ==""){
            
    }
    else {
        checkEExitLineCode(inputValueLineCode.value);
    }
};

const checkEExitLineCode = (linecode : string) => {
  if (responseLineCode.value.some(item => item.name === linecode)) {
    fetchDataLineCode(linecode);
    } else {
        postDataEgate(linecode);
    }
};

const postDataEgate =(linecode : string) => {
  console.log("post:"+linecode)
  fetch(`https://localhost:7079/api/ImageForFlight?Name=${linecode}`, {
        //fetch(`http://172.17.18.12:8085/api/ImageForFlight?Name=${linecode}`, {
        method: 'POST'
        })
        .then(response => {
    // Kiểm tra mã trạng thái HTTP
    if (!response.ok) {
      console.log("post no ok:"+linecode)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Kiểm tra phản hồi không rỗng
    if (response.headers.get("content-length") === "0") {
      throw new Error("Empty response from server");
    }
    return response.json();
  })
  .then(data => {
    console.log("Server response:", data);
    responseDataFlight.value = data;
    loadlinecode(); // Lưu phản hồi vào biến
  })
        .catch(error => {
            console.error(error);
        });
};

const handleLineCodeClick = (name : string) => {
  fetchDataLineCode(name);
};

const SelectNomal = async(name: string) => {
  if (responseDataFlight.value && name === responseDataFlight.value.nomal) return;
  if(responseDataFlight.value)
  {
    try {
      const response = await fetch("https://localhost:7079/api/UpdateModeCounter/UpdateNomal", {
       // const response = await fetch("http://172.17.18.12:8085/api/UpdateModeCounter/UpdateNomal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: responseDataFlight.value.name,
          Nomal: name,
          Eco: "",
          Bus: "",
          Manual: "",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update mode in the database.");
      }
      responseDataFlight.value.nomal = name;
      isNomalVisible.value = !isNomalVisible.value;
    } catch (error) {
      console.error("Error updating mode:", error);
      alert("Failed to update mode. Please try again.");
    }
  }
};

const SelectEco = async(eco: string) => {
  if (responseDataFlight.value && eco === responseDataFlight.value.eco) return;
  if(responseDataFlight.value)
  {
    console.log("`"+responseDataFlight.value.name +"`"+ eco);
    try {
      const response = await fetch(`https://localhost:7079/api/UpdateModeCounter/UpdateEco`, {
       // const response = await fetch(`http://172.17.18.12:8085/api/UpdateModeCounter/UpdateEco`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: responseDataFlight.value.name,
          nomal: "",
          eco: eco,
          bus: "",
          manual: "",
        }),
        
      });
      console.log(JSON.stringify({
          name: responseDataFlight.value.name,
          nomal: "",
          eco: eco,
          bus: "",
          manual: "",
        }),)
      
      if (!response.ok) {
        throw new Error("Failed to update mode in the database.");
      }
      responseDataFlight.value.eco = eco;
      isEcoVisible.value = !isEcoVisible.value;
    } catch (error) {
      console.error("Error updating mode:", error);
      alert("Failed to update mode. Please try again.");
    }
  }
};

const SelectBus = async(name: string) => {
  if (responseDataFlight.value && name === responseDataFlight.value.bus) return;
  if(responseDataFlight.value)
  {
    try {
      const response = await fetch("https://localhost:7079/api/UpdateModeCounter/UpdateBus", {
       // const response = await fetch("http://172.17.18.12:8085/api/UpdateModeCounter/UpdateBus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: responseDataFlight.value.name,
          Nomal: "",
          Eco: "",
          Bus: name,
          Manual: "",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update mode in the database.");
      }
      responseDataFlight.value.bus = name;
      isBusVisible.value = !isBusVisible.value;
    } catch (error) {
      console.error("Error updating mode:", error);
      alert("Failed to update mode. Please try again.");
    }
  }
};

const SelectManual = async(name: string) => {
  if (responseDataFlight.value && name === responseDataFlight.value.manual) return;
  if(responseDataFlight.value)
  {
    try {
      const response = await fetch("https://localhost:7079/api/UpdateModeCounter/UpdateManual", {
        //const response = await fetch("http://172.17.18.12:8085/api/UpdateModeCounter/UpdateManual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: responseDataFlight.value.name,
          Nomal: "",
          Eco: "",
          Bus: "",
          Manual: name,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update mode in the database.");
      }
      responseDataFlight.value.manual = name;
      isManualVisible.value = !isManualVisible.value;
    } catch (error) {
      console.error("Error updating mode:", error);
      alert("Failed to update mode. Please try again.");
    }
  }
};





const hubConnection = ref<signalR.HubConnection | null>(null);
const connectHub = async () => {
  const url = urlHub;
  hubConnection.value = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .configureLogging(signalR.LogLevel.Information)
      .build();
      receiverUpdate();
    try {
      await hubConnection.value.start();
    } catch (err) {
      console.error('SignalR Connection failed to start:', err);
      startInterval();
    }
  hubConnection.value.onclose(() => {
      console.log('Connection closed');
      startInterval();
    });
};

const updateMode = async (item: any, newMode:string) => {
  if (item.mode === newMode) return; // Nếu mode không thay đổi, không làm gì cả

  try {
    // Cập nhật mode trong cơ sở dữ liệu qua API
    const response = await fetch("https://localhost:7079/api/UpdateModeCounter/UpdateMode", {
      //const response = await fetch("http://172.17.18.12:8085/api/UpdateModeCounter/UpdateMode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        mode: newMode,
        auto: item.auto,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update mode in the database.");
    }
    item.mode = newMode;

    console.log(`Mode for ${item.name} updated to ${newMode}`);
  } catch (error) {
    console.error("Error updating mode:", error);
    alert("Failed to update mode. Please try again.");
  }
};

const updateAuto = async (item: any) => {
  try {
    // Cập nhật mode trong cơ sở dữ liệu qua API
    const response = await fetch("https://localhost:7079/api/UpdateModeCounter/UpdateAuto", {
      //const response = await fetch("http://172.17.18.12:8085/api/UpdateModeCounter/UpdateAuto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        mode: item.mode,
        auto: item.auto === "True"? "False" : "True",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update mode in the database.");
    }
    item.auto = item.auto === "True"? "False" : "True";

    console.log(`Auto for ${item.name} updated to ${item.auto === "True"? "True" : "False"}`);
  } catch (error) {
    console.error("Error updating mode:", error);
    alert("Failed to update mode. Please try again.");
  }
};

const responseFileName = ref<(string | null)[]>([]);
const fetchDataFileName=() => {
  const headers = new Headers();
    headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    const url = `http://localhost:3001/imageforcheckin`;
    //const url = `http://172.17.18.12:3001/imageforcheckin`;
    fetch(url)
    .then(response => response.json())
    .then(data  => {
        responseFileName.value = data;
        })
    .catch(error => {
        // Xử lý lỗi nếu có
        console.error(error);
    });
};

const responseFileNameForNomal = ref<(string | null)[]>([]);
const fetchDataFileNameForNomal=() => {
  const headers = new Headers();
    headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    const url = `http://localhost:3001/imageforcheckinNonal`;
    //const url = `http://172.17.18.12:3001/imageforcheckinNonal`; 
    fetch(url)
    .then(response => response.json())
    .then(data  => {
      responseFileNameForNomal.value = data;
        })
    .catch(error => {
        // Xử lý lỗi nếu có
        console.error(error);
    });
};


const receiverUpdate= () => {
{
    hubConnection.value!.on("SendToServer", (data: any) => {
        console.log("Received flight update from server:", data);
        responseData.value = data || [];
    });
}
};
const handleImageError = (item: string) => {
    item = 'AHT';
};


const handleSetupClick = (item:any) => {
  responseDataFlight.value.name = item.flight.length >= 2 ? item.flight.substring(0, 2):"";
  responseDataFlight.value.nomal = item.nomal;
  responseDataFlight.value.eco = item.eco;
  responseDataFlight.value.bus = item.bus;
  responseDataFlight.value.manual =item.manual;
};

const handleReloadClick = (item: any) => {
        if(item.connectionId !=""){
            hubConnection.value!.invoke("SendReloadToClient", item.connectionId, item.name)
            .catch(function (err) {
            return console.error(err.toString());
            });
        }
        else
        {
            alert("Gate disconnect !...")
        }
    };
const convertToTimeOnly = (isoString: Date) =>{
  const date = new Date(isoString); 
  const hours = date.getHours().toString().padStart(2, '0'); 
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`; 
}


// Hàm thiết lập kiểm tra định kỳ
const intervalId1 = ref<number | null>(null);
const startCheckingFlights = () => {
  if (intervalId1.value !== null) {
    clearInterval(intervalId1.value);
  }
  intervalId1.value = window.setInterval(() => {
    //checkFlightsAndDelete();
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
    console.log("SignalR reconnection established");
    receiverUpdate();
    // Dừng interval nếu kết nối thành công
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
  await connectHub();
  fetchDataFileName();
  fetchDataFileNameForNomal();
  fetchDataLineCode("VN");
  loadlinecode();
  window.addEventListener("scroll", handleScroll);
  
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);

});


</script>

<style>
.card.main {
    display: flex;
    flex-direction: row;
    width: 100vw;
}

.table td, .table th {
    padding: 0.25rem;
}
.hiden {
    display: none;
}
.GateChange {
    cursor: pointer;
}
.auto {
    cursor: pointer;
}
.reloadgate {
    cursor: pointer;
}
.active-class {
  background-color: yellow;
}
nav.navbar.navbar-expand.navbar-white.navbar-light {
    background-color: #31d2f2 !important;
    color: #000000;
    font-weight: 500;
    padding: 0px;
    height: 33px;
}
.navbar-light .navbar-nav .nav-link {
    color: rgb(0 0 0);
}
.card-body.maindtth {
    display: flex;
    flex-wrap: wrap;
    width: 100% !important;
    padding: 2px;
}
.lineCode {
    width: 11.33%;
    box-sizing: border-box;
    padding: 5px;
    text-align: center;
    cursor: pointer;
}
.lineCode:hover {
    background-color: #80808029;
    border-radius: 4px;
}

.checkput {
    text-align: center;
}

tr:nth-child(even) {
    background-color: #e8ebee;
}

.container {
  background-color: #f9f9f9; /* Màu nền sáng */
  padding: 20px;
  border-radius: 10px; /* Bo góc cho container */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
  max-width: 400px; /* Giới hạn chiều rộng */
  margin: 0 auto; /* Căn giữa container */
  font-family: Arial, sans-serif; /* Font chữ cơ bản */
}

/* Cấu trúc từng hàng */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0; /* Khoảng cách giữa các hàng */
  border-bottom: 1px solid #e0e0e0; /* Đường kẻ chia hàng */
}

/* Loại bỏ border cho hàng cuối cùng */
.row:last-child {
  border-bottom: none;
}

/* Nhãn (label) của từng dòng */
.label {
  font-weight: bold; /* Tô đậm chữ */
  color: #333; /* Màu chữ tối hơn cho nhãn */
  flex: 1; /* Đẩy nhãn sang bên trái */
}

/* Giá trị (value) */
.value {
  color: #555; /* Màu chữ nhẹ hơn */
  flex: 1; /* Đẩy giá trị sang giữa */
  text-align: center;
}

/* Biểu tượng (icon) */
.icon {
  color: #1e90ff; /* Màu xanh dương nổi bật */
  font-size: 1.2em; /* Tăng kích thước icon */
  cursor: pointer; /* Hiệu ứng con trỏ */
  transition: transform 0.2s, color 0.2s; /* Hiệu ứng khi hover */
}

/* Hiệu ứng hover trên icon */
.icon:hover {
  color: #0056b3; /* Đổi màu khi hover */
  transform: scale(1.1); /* Phóng to nhẹ */
}

.card-body.pad.table-responsive.poisionfid {
    position: fixed;
    right: 0px;
    overflow: hidden;
}
.tabmain {
    width: 71vw;
}

.shrink {
  top: 5px;
}
</style>