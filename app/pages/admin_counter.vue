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
                <i class="fas fa-images icon" @click="openImagePicker('nomal')"></i>
              </div>

              <!-- Economy -->
              <div class="row">
                <span class="label">Economy:</span>
                <span class="value">{{ responseDataFlight.eco || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="openImagePicker('eco')"></i>
              </div>

              <!-- Business -->
              <div class="row">
                <span class="label">Business:</span>
                <span class="value">{{ responseDataFlight.bus || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="openImagePicker('bus')"></i>
              </div>

              <!-- Manual -->
              <div class="row">
                <span class="label">Set Manual:</span>
                <span class="value">{{ responseDataFlight.manual || 'Loading...' }}</span>
                <i class="fas fa-images icon" @click="openImagePicker('manual')"></i>
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

  <!-- Image Picker Modal -->
  <Teleport to="body">
    <div v-if="picker.visible" class="picker-overlay" @click.self="picker.visible = false">
      <div class="picker-modal">
        <div class="picker-header">
          <span>Select images for <strong>{{ picker.field }}</strong></span>
          <i class="fas fa-times" style="cursor:pointer" @click="picker.visible = false"></i>
        </div>
        <div class="picker-grid">
          <div
            v-for="img in imageLibrary"
            :key="img.id"
            :class="['picker-item', picker.selected.includes(img.url) ? 'selected' : '']"
            @click="toggleImage(img.url)"
          >
            <img :src="img.url" :alt="img.fileName" />
            <span>{{ img.fileName }}</span>
          </div>
        </div>
        <div class="picker-footer">
          <span class="picker-preview">{{ picker.selected.length }} image(s) selected</span>
          <button class="btn btn-primary" @click="confirmPicker">Save</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import * as signalR from '@microsoft/signalr';
import { ref, reactive, onMounted, onUnmounted } from 'vue';

const urlHub    = 'https://localhost:7079/dashboardHub';
const urlApi    = 'https://localhost:7079/api';
const urlImages = 'http://localhost:5051/api/Images';

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

interface ImageItem {
  id: string;
  fileName: string;
  url: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

const responseData       = ref<CounterItem[]>([]);
const responseLineCode   = ref<LineCode[]>([]);
const responseDataFlight = ref<FlightImage>({ name: '', nomal: '', eco: '', bus: '', manual: '' });
const imageLibrary       = ref<ImageItem[]>([]);

const inputValueLineCode = ref('');
const isScrolled         = ref(false);

const picker = reactive<{ visible: boolean; field: string; selected: string[] }>({
  visible: false,
  field: '',
  selected: [],
});

// ─── Image Gallery Picker ─────────────────────────────────────────────────────

const fetchImageLibrary = async () => {
  if (imageLibrary.value.length > 0) return;
  try {
    const res = await fetch(urlImages);
    const json = await res.json();
    imageLibrary.value = json.data ?? [];
  } catch (err) {
    console.error('[fetchImageLibrary]', err);
  }
};

const openImagePicker = async (field: string) => {
  await fetchImageLibrary();
  picker.field = field;
  const current = responseDataFlight.value[field as keyof FlightImage] ?? '';
  picker.selected = current ? current.split(',').map(s => s.trim()).filter(Boolean) : [];
  picker.visible = true;
};

const toggleImage = (url: string) => {
  const idx = picker.selected.indexOf(url);
  if (idx === -1) picker.selected.push(url);
  else picker.selected.splice(idx, 1);
};

const confirmPicker = async () => {
  const value = picker.selected.join(',');
  const field = picker.field;
  if (field === 'nomal')       await SelectNomal(value);
  else if (field === 'eco')    await SelectEco(value);
  else if (field === 'bus')    await SelectBus(value);
  else if (field === 'manual') await SelectManual(value);
  picker.visible = false;
};

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

// ─── Image Selection (save to DB) ─────────────────────────────────────────────

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
  receiverUpdate(); // register handler BEFORE start so OnConnectedAsync push is not missed
  try {
    await hubConnection.value.start();
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

/* ── Image Picker Modal ────────────────────────────────────────────────────── */
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.picker-modal {
  background: #fff;
  border-radius: 10px;
  width: 680px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #31d2f2;
  font-weight: bold;
  font-size: 1em;
}
.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px;
  overflow-y: auto;
  flex: 1;
}
.picker-item {
  width: 140px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  padding: 6px;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
}
.picker-item img {
  width: 100%;
  height: 80px;
  object-fit: contain;
  border-radius: 4px;
}
.picker-item span {
  display: block;
  font-size: 0.72em;
  margin-top: 4px;
  word-break: break-all;
  color: #444;
}
.picker-item.selected {
  border-color: #1e90ff;
  background: #e8f4ff;
}
.picker-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-top: 1px solid #eee;
}
.picker-preview {
  font-size: 0.9em;
  color: #555;
}
</style>
