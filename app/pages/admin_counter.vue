<template>
  <section class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="card main">
          <div class="card-body pad table-responsive" style="width: 73vw">
            <table class="table table-hover tabmain">
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
              <tbody>
                <tr v-for="item in responseData" :key="item.id"
                    @click="handleSetupClick(item)"
                    style="font-weight: 500; font-size: larger;">
                  <td>
                    <i class="reloadgate fas fa-sync-alt"
                       @click.stop="handleReloadClick(item)"
                       style="font-size: 15px; color:#0b1c60; margin-left: 19%;"></i>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.ip }}</td>
                  <td>{{ item.location }}</td>
                  <td class="checkput">
                    <i :class="['fas fa-circle fa-lg', item.connectionId ? 'text-green' : 'text-gray']"></i>
                  </td>
                  <td :class="item.connectionId ? 'text-green' : 'text-gray'">{{ convertToTimeOnly(item.openTime) }}</td>
                  <td :class="item.connectionId ? 'text-green' : 'text-gray'">{{ convertToTimeOnly(item.closeTime) }}</td>
                  <td :class="item.connectionId ? 'text-green' : 'text-gray'">{{ item.flight }}</td>
                  <td class="checkput" @click.stop="updateMode(item, 'Nomal')">
                    <i :class="['auto fa-2xl', item.mode !== 'Nomal' ? 'far fa-circle' : 'fas fa-dot-circle']"
                       style="font-size: x-large; color:#0b1c60"></i>
                  </td>
                  <td class="checkput" @click.stop="updateMode(item, 'Eco')">
                    <i :class="['auto fa-2xl', item.mode !== 'Eco' ? 'far fa-circle' : 'fas fa-dot-circle']"
                       style="font-size: x-large; color:#0b1c60"></i>
                  </td>
                  <td class="checkput" @click.stop="updateMode(item, 'Bus')">
                    <i :class="['auto fa-2xl', item.mode !== 'Bus' ? 'far fa-circle' : 'fas fa-dot-circle']"
                       style="font-size: x-large; color:#0b1c60"></i>
                  </td>
                  <td :class="item.connectionId ? 'text-green' : 'text-gray'">{{ item.status }}</td>
                  <td class="checkput" @click.stop="updateAuto(item)">
                    <i :class="['auto fas fa-2xl', item.auto !== 'True' ? 'fa-toggle-off' : 'fa-toggle-on']"
                       style="font-size: x-large; color:#0b1c60"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div :class="{ shrink: isScrolled }" class="card-body pad table-responsive poisionfid" style="width: 27vw">
            <table class="table table-hover">
              <thead class="theadheader" style="background-color: #31d2f2;">
                <tr>
                  <th>Set Image</th>
                  <th>{{ responseDataFlight.name }}</th>
                </tr>
              </thead>
            </table>

            <div class="container">
              <!-- Nomal -->
              <div class="row">
                <span class="label">Nomal:</span>
                <span class="value">{{ responseDataFlight.nomal || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="toggleSelectNomal"></i>
              </div>
              <div class="row" v-if="isNomalVisible">
                <div class="form-group" style="width: 100%;">
                  <select multiple class="custom-select" v-model="selectedOptionsNomal" style="height: 200px !important;">
                    <option v-for="(item, index) in responseFileNameForNomal" :key="index" :value="item">{{ item }}</option>
                  </select>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%;">
                  <span>{{ selectedOptionsNomal.join(',') }}</span>
                  <i class="fas fa-upload icon" @click="SelectNomal(selectedOptionsNomal.join(','))"></i>
                </div>
              </div>

              <!-- Economy -->
              <div class="row">
                <span class="label">Economy:</span>
                <span class="value">{{ responseDataFlight.eco || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="toggleSelectEco"></i>
              </div>
              <div class="row" v-if="isEcoVisible">
                <div class="form-group" style="width: 100%;">
                  <select multiple class="custom-select" v-model="selectedOptionsEco" style="height: 200px !important;">
                    <option v-for="(item, index) in responseFileName" :key="index" :value="item">{{ item }}</option>
                  </select>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%;">
                  <span>{{ selectedOptionsEco.join(',') }}</span>
                  <i class="fas fa-upload icon" @click="SelectEco(selectedOptionsEco.join(','))"></i>
                </div>
              </div>

              <!-- Business -->
              <div class="row">
                <span class="label">Business:</span>
                <span class="value">{{ responseDataFlight.bus || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="toggleSelectBus"></i>
              </div>
              <div class="row" v-if="isBusVisible">
                <div class="form-group" style="width: 100%;">
                  <select multiple class="custom-select" v-model="selectedOptionsBus" style="height: 200px !important;">
                    <option v-for="(item, index) in responseFileName" :key="index" :value="item">{{ item }}</option>
                  </select>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%;">
                  <span>{{ selectedOptionsBus.join(',') }}</span>
                  <i class="fas fa-upload icon" @click="SelectBus(selectedOptionsBus.join(','))"></i>
                </div>
              </div>

              <!-- Manual -->
              <div class="row">
                <span class="label">Set Manual:</span>
                <span class="value">{{ responseDataFlight.manual || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="toggleSelectManual"></i>
              </div>
              <div class="row" v-if="isManualVisible">
                <div class="form-group" style="width: 100%;">
                  <select multiple class="custom-select" v-model="selectedOptionsManual" style="height: 200px !important;">
                    <option v-for="(item, index) in responseFileName" :key="index" :value="item">{{ item }}</option>
                  </select>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%;">
                  <span>{{ selectedOptionsManual.join(',') }}</span>
                  <i class="fas fa-upload icon" @click="SelectManual(selectedOptionsManual.join(','))"></i>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12" style="margin-top: 10px;">
                <div class="card">
                  <div class="card-header" style="height: 42px; margin-top: -4px; background-color: #31d2f2;">
                    <h3 class="card-title" style="font-weight: bold;">Airline Code</h3>
                    <div class="card-tools">
                      <div class="input-group input-group-sm" style="width: 150px;">
                        <input type="text" v-model="inputValueLineCode"
                               class="form-control float-right" placeholder="Search">
                        <div class="input-group-append">
                          <button type="submit" class="btn btn-default" @click="handleCheckLineCodeClick">
                            <i class="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-body maindtth">
                    <div class="lineCode" v-for="item in responseLineCode" :key="item.name"
                         @click="handleLineCodeClick(item.name)">
                      {{ item.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as signalR from '@microsoft/signalr';
import { ref, onMounted, onUnmounted } from 'vue';

const urlHub = 'https://localhost:7079/dashboardHub';
const urlApi  = 'https://localhost:7079/api';
const urlFileServer = 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CounterItem {
  id: string;
  name: string;
  ip: string;
  location: string;
  openTime: Date;
  closeTime: Date;
  flight: string;
  status: string;
  mode: string;
  auto: string;
  connectionId: string;
  nomal: string;
  eco: string;
  bus: string;
  manual: string;
}

interface FlightImage {
  name: string;
  nomal: string;
  eco: string;
  bus: string;
  manual: string;
}

interface LineCode {
  name: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

const responseData        = ref<CounterItem[]>([]);
const responseLineCode    = ref<LineCode[]>([]);
const responseFileName    = ref<string[]>([]);
const responseFileNameForNomal = ref<string[]>([]);
const responseDataFlight  = ref<FlightImage>({ name: '', nomal: '', eco: '', bus: '', manual: '' });

const inputValueLineCode  = ref('');
const isScrolled          = ref(false);

const selectedOptionsNomal  = ref<string[]>([]);
const selectedOptionsEco    = ref<string[]>([]);
const selectedOptionsBus    = ref<string[]>([]);
const selectedOptionsManual = ref<string[]>([]);

const isNomalVisible  = ref(false);
const isEcoVisible    = ref(false);
const isBusVisible    = ref(false);
const isManualVisible = ref(false);

const toggleSelectNomal  = () => { isNomalVisible.value  = !isNomalVisible.value; };
const toggleSelectEco    = () => { isEcoVisible.value    = !isEcoVisible.value; };
const toggleSelectBus    = () => { isBusVisible.value    = !isBusVisible.value; };
const toggleSelectManual = () => { isManualVisible.value = !isManualVisible.value; };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const convertToTimeOnly = (isoString: Date): string => {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const handleScroll = () => { isScrolled.value = window.scrollY >= 20; };

// ─── Data Fetching ────────────────────────────────────────────────────────────

const loadlinecode = () => {
  fetch(`${urlApi}/ImageForFlight`)
    .then(r => r.json())
    .then(data => { responseLineCode.value = data; })
    .catch(err => console.error('[loadlinecode]', err));
};

const fetchDataLineCode = (name: string) => {
  fetch(`${urlApi}/ImageForFlight/${name}`)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => { responseDataFlight.value = data; })
    .catch(err => console.error('[fetchDataLineCode]', err));
};

const fetchDataFileName = () => {
  fetch(`${urlFileServer}/imageforcheckin`)
    .then(r => r.json())
    .then(data => { responseFileName.value = data; })
    .catch(err => console.error('[fetchDataFileName]', err));
};

const fetchDataFileNameForNomal = () => {
  fetch(`${urlFileServer}/imageforcheckinNonal`)
    .then(r => r.json())
    .then(data => { responseFileNameForNomal.value = data; })
    .catch(err => console.error('[fetchDataFileNameForNomal]', err));
};

// ─── Airline Code Actions ─────────────────────────────────────────────────────

const handleCheckLineCodeClick = () => {
  const code = inputValueLineCode.value.trim();
  if (!code) return;
  if (responseLineCode.value.some(item => item.name === code)) {
    fetchDataLineCode(code);
  } else {
    postDataLineCode(code);
  }
};

const postDataLineCode = (linecode: string) => {
  fetch(`${urlApi}/ImageForFlight?Name=${linecode}`, { method: 'POST' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => { responseDataFlight.value = data; loadlinecode(); })
    .catch(err => console.error('[postDataLineCode]', err));
};

const handleLineCodeClick = (name: string) => fetchDataLineCode(name);

// ─── Image Selection ──────────────────────────────────────────────────────────

const SelectNomal = async (name: string) => {
  if (!name || name === responseDataFlight.value.nomal) return;
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateNomal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: responseDataFlight.value.name, nomal: name, eco: '', bus: '', manual: '' }),
    });
    if (!res.ok) throw new Error('Update failed');
    responseDataFlight.value.nomal = name;
    isNomalVisible.value = false;
    selectedOptionsNomal.value = [];
  } catch (err) { console.error('[SelectNomal]', err); }
};

const SelectEco = async (eco: string) => {
  if (!eco || eco === responseDataFlight.value.eco) return;
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateEco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: responseDataFlight.value.name, nomal: '', eco, bus: '', manual: '' }),
    });
    if (!res.ok) throw new Error('Update failed');
    responseDataFlight.value.eco = eco;
    isEcoVisible.value = false;
    selectedOptionsEco.value = [];
  } catch (err) { console.error('[SelectEco]', err); }
};

const SelectBus = async (bus: string) => {
  if (!bus || bus === responseDataFlight.value.bus) return;
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateBus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: responseDataFlight.value.name, nomal: '', eco: '', bus, manual: '' }),
    });
    if (!res.ok) throw new Error('Update failed');
    responseDataFlight.value.bus = bus;
    isBusVisible.value = false;
    selectedOptionsBus.value = [];
  } catch (err) { console.error('[SelectBus]', err); }
};

const SelectManual = async (manual: string) => {
  if (!manual || manual === responseDataFlight.value.manual) return;
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateManual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: responseDataFlight.value.name, nomal: '', eco: '', bus: '', manual }),
    });
    if (!res.ok) throw new Error('Update failed');
    responseDataFlight.value.manual = manual;
    isManualVisible.value = false;
    selectedOptionsManual.value = [];
  } catch (err) { console.error('[SelectManual]', err); }
};

// ─── Counter Row Actions ──────────────────────────────────────────────────────

const handleSetupClick = (item: CounterItem) => {
  responseDataFlight.value = {
    name:   item.flight.length >= 2 ? item.flight.substring(0, 2) : '',
    nomal:  item.nomal,
    eco:    item.eco,
    bus:    item.bus,
    manual: item.manual,
  };
};

const handleReloadClick = (item: CounterItem) => {
  if (!item.connectionId) { alert('Counter is disconnected!'); return; }
  hubConnection.value?.invoke('SendReloadToClient', item.connectionId, item.name)
    .catch(err => console.error('[handleReloadClick]', err));
};

const updateMode = async (item: CounterItem, newMode: string) => {
  if (item.mode === newMode) return;
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateMode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name, mode: newMode, auto: item.auto }),
    });
    if (!res.ok) throw new Error('Update failed');
    item.mode = newMode;
  } catch (err) { console.error('[updateMode]', err); }
};

const updateAuto = async (item: CounterItem) => {
  const newAuto = item.auto === 'True' ? 'False' : 'True';
  try {
    const res = await fetch(`${urlApi}/UpdateModeCounter/UpdateAuto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name, mode: item.mode, auto: newAuto }),
    });
    if (!res.ok) throw new Error('Update failed');
    item.auto = newAuto;
  } catch (err) { console.error('[updateAuto]', err); }
};

// ─── SignalR ──────────────────────────────────────────────────────────────────

const hubConnection = ref<signalR.HubConnection | null>(null);
const intervalId    = ref<number | null>(null);

const receiverUpdate = () => {
  hubConnection.value!.off('SendToServer');
  hubConnection.value!.on('SendToServer', (data: CounterItem[]) => {
    responseData.value = data ?? [];
  });
};

const connectHub = async () => {
  hubConnection.value = new signalR.HubConnectionBuilder()
    .withUrl(urlHub)
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();
  try {
    await hubConnection.value.start();
    receiverUpdate();
  } catch (err) {
    console.error('[SignalR] Connection failed:', err);
    startInterval();
  }
  hubConnection.value.onreconnected(() => { receiverUpdate(); });
  hubConnection.value.onclose(() => { startInterval(); });
};

const reconnectHub = async () => {
  try {
    if (hubConnection.value) { try { await hubConnection.value.stop(); } catch {} }
    await connectHub();
    if (intervalId.value !== null) { clearInterval(intervalId.value); intervalId.value = null; }
  } catch (err) { console.error('[SignalR] Manual reconnect failed:', err); }
};

const startInterval = () => {
  if (intervalId.value !== null) clearInterval(intervalId.value);
  intervalId.value = window.setInterval(reconnectHub, 30000);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await connectHub();
  fetchDataFileName();
  fetchDataFileNameForNomal();
  fetchDataLineCode('VN');
  loadlinecode();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (intervalId.value !== null) clearInterval(intervalId.value);
  hubConnection.value?.stop();
});
</script>

<style>
.card.main {
  display: flex;
  flex-direction: row;
  width: 100vw;
}
.table td, .table th { padding: 0.25rem; }
.hiden { display: none; }
.GateChange, .auto, .reloadgate { cursor: pointer; }
.active-class { background-color: yellow; }

nav.navbar.navbar-expand.navbar-white.navbar-light {
  background-color: #31d2f2 !important;
  color: #000;
  font-weight: 500;
  padding: 0;
  height: 33px;
}
.navbar-light .navbar-nav .nav-link { color: rgb(0 0 0); }

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
.lineCode:hover { background-color: #80808029; border-radius: 4px; }
.checkput { text-align: center; }
tr:nth-child(even) { background-color: #e8ebee; }

.container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}
.row:last-child { border-bottom: none; }
.label { font-weight: bold; color: #333; flex: 1; }
.value { color: #555; flex: 1; text-align: center; }
.icon {
  color: #1e90ff;
  font-size: 1.2em;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}
.icon:hover { color: #0056b3; transform: scale(1.1); }

.card-body.pad.table-responsive.poisionfid {
  position: fixed;
  right: 0;
  overflow: hidden;
}
.tabmain { width: 71vw; }
.shrink { top: 5px; }
</style>