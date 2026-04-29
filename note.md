# FIDS Spare V2 — Ghi chú tiến độ

> Cập nhật: 2026-04-29 12:30

---

## ✅ Đã hoàn thành

### 1. Header Theme — Chuyển từ `.env` sang JSON config

**Vấn đề:** Giá trị theme trong `.env` chỉ được đọc khi Nuxt server khởi động. Sửa `.env` phải restart `npm run dev`, reload trang không nhận giá trị mới.

**Giải pháp:**
- Tạo file `public/config/header-theme.json` chứa cấu hình theme (logo, màu, icon)
- Sửa `app/composables/useHeaderTheme.ts` — fetch từ JSON thay vì đọc runtimeConfig
- Thêm cache-busting `?_t=Date.now()` để tránh browser cache
- Thứ tự ưu tiên: **JSON config > runtimeConfig/.env > DEFAULTS**

**Files đã sửa:**
- `public/config/header-theme.json` — **MỚI**
- `app/composables/useHeaderTheme.ts` — Sửa `loadTheme()` fetch JSON
- `nuxt.config.ts` — Thêm `ahtLogoUrl` vào runtimeConfig (fallback)
- `.env` — Cập nhật giá trị theme

---

### 2. Thêm `ahtLogoUrl` vào HeaderTheme

- Thêm property `ahtLogoUrl` vào interface `HeaderTheme`
- Thêm vào `DEFAULTS`, `mergeTheme()`, `nuxt.config.ts`, `header-theme.json`
- Chạy `npx nuxi prepare` để regenerate types trong `.nuxt/`

> **Lưu ý:** Mỗi lần thêm/xóa property trong `runtimeConfig`, cần chạy `npx nuxi prepare` hoặc restart dev server.

---

### 3. AirlineLogo — Sửa location cho DeparturesT1

**Vấn đề:** `DeparturesT1In.vue` và `DeparturesT1Out.vue` cần dùng location `'Stand'` nhưng đang gọi `useAirlineLogos('FIDs')`.

**Giải pháp:**
- Sửa `DeparturesT1In.vue` + `DeparturesT1Out.vue`: `useAirlineLogos('Stand')`
- Sửa `AirlineLogo.vue`: sử dụng prop `location` khi gọi `useAirlineLogos(props.location ?? 'FIDs')`
- Truyền `location="Stand"` vào `<AirlineLogo>` trong template của 2 page T1

**Files đã sửa:**
- `app/components/AirlineLogo.vue` — Dùng prop location
- `app/pages/DeparturesT1In.vue` — `useAirlineLogos('Stand')` + `<AirlineLogo location="Stand">`
- `app/pages/DeparturesT1Out.vue` — Tương tự

**Mapping location hiện tại:**

| Page | Location |
|---|---|
| DeparturesT1In, DeparturesT1Out | `'Stand'` |
| Tất cả Collins, Arrival, DepArr | `'FIDs'` |
| gate.vue | `'FullScreen'` |

---

### 4. Auto-refresh cho 100 FIDS client

**Vấn đề:** Khi đổi logo/theme trên server, 100 client không tự cập nhật.

**Giải pháp — 2 tầng:**

#### Tầng 1: Polling tự động (hoạt động ngay, không cần backend)
- `useHeaderTheme` — polling mỗi **2 phút** (đã có sẵn qua `startPolling()` trong các Header component)
- `useAirlineLogos` — thêm `reloadAll()` + `startPolling()` polling mỗi **10 phút**

#### Tầng 2: SignalR broadcast (cần backend hỗ trợ)
- Tạo `app/composables/useFidsSignalR.ts` — kết nối `dashboardHub`, lắng nghe 3 lệnh:
  - `"ReloadPage"` → `window.location.reload()`
  - `"ReloadTheme"` → fetch lại `header-theme.json`
  - `"ReloadLogos"` → fetch lại airline logos
- Tạo `app/plugins/fids-signalr.client.ts` — plugin tự động connect cho tất cả page

**Files đã tạo/sửa:**
- `app/composables/useAirlineLogos.ts` — Thêm `reloadAll()`, `startPolling()`, `stopPolling()`
- `app/composables/useFidsSignalR.ts` — **MỚI**
- `app/plugins/fids-signalr.client.ts` — **MỚI**

---

## 🔧 Đang làm dở / Cần tiếp tục

### 1. Backend C# — Thêm SignalR broadcast

Backend cần thêm gọi SendAsync khi admin thay đổi theme/logo:

```csharp
// Khi admin đổi header theme
await Clients.All.SendAsync("ReloadTheme");

// Khi admin đổi airline logo  
await Clients.All.SendAsync("ReloadLogos");

// Khi cần reload toàn trang (thay đổi lớn)
await Clients.All.SendAsync("ReloadPage");
```

### 2. Airline logos — Gọi `startPolling()` trong các page

Hiện `useAirlineLogos` đã có `startPolling()` nhưng **chưa được gọi** trong các page. 
Cần thêm vào `onMounted` của các page sử dụng logo:

```ts
const { loadAll, startPolling } = useAirlineLogos('FIDs')

onMounted(async () => {
  await loadAll()
  startPolling()  // ← Thêm dòng này
})
```

**Các page cần sửa:**
- [ ] `Arrival.vue`
- [ ] `Arrival85.vue`
- [ ] `DepArr_Collins.vue`
- [ ] `Departures_Collins.vue`
- [ ] `DeparturesA_Collins.vue`
- [ ] `DeparturesB_Collins.vue`
- [ ] `DeparturesT1In.vue`
- [ ] `DeparturesT1Out.vue`

### 3. Kiểm tra `useFidsSignalR` plugin hoạt động đúng

- Plugin `fids-signalr.client.ts` tự connect cho tất cả page
- Cần test: mở browser console, kiểm tra log `[FidsSignalR] Connected to hub`
- Nếu backend chưa sẵn sàng hub, plugin sẽ retry mỗi 30 giây (không ảnh hưởng app)

### 4. Xung đột SignalR connection

Một số page (`gate.vue`, `checkin.vue`, `admin_counter.vue`) đã có **riêng** một `hubConnection` kết nối `dashboardHub`.
Plugin `fids-signalr.client.ts` tạo thêm **1 connection nữa**.

**Cân nhắc:**
- Hiện tại: 2 connection song song (1 cho data, 1 cho reload commands) — **chấp nhận được**
- Tối ưu sau: Gộp thành 1 connection duy nhất nếu muốn tiết kiệm resource

### 5. Các Header component đang dùng `startPolling()` cũ

Các file sau đã gọi `startPolling()` (theme polling 2 phút) — **đã hoạt động OK**:
- `AppHeader.vue`
- `AppHeaderArr.vue`, `AppHeaderArr85.vue`
- `AppHeaderArrCollins.vue`
- `AppHeaderDep.vue`, `AppHeaderDepCollins.vue`

---

## 📁 Cấu trúc file quan trọng

```
app/
├── composables/
│   ├── useHeaderTheme.ts      — Theme config từ JSON, polling 2 phút
│   ├── useAirlineLogos.ts     — Airline logos với reloadAll + polling
│   ├── useFidsSignalR.ts      — SignalR hub cho reload commands
│   ├── useAuth.ts
│   └── useToast.ts
├── components/
│   ├── AirlineLogo.vue        — Nhận prop location, đọc đúng cache
│   └── Home/
│       ├── AppHeader*.vue     — Dùng useHeaderTheme, có startPolling
│       └── AppFooter.vue
├── plugins/
│   └── fids-signalr.client.ts — Auto-connect SignalR cho tất cả page
└── pages/
    ├── Arrival.vue, Arrival85.vue
    ├── DepArr_Collins.vue, Departures*_Collins.vue
    ├── DeparturesT1In.vue, DeparturesT1Out.vue  — location='Stand'
    ├── gate.vue, checkin.vue
    ├── admin.vue, admin_counter.vue
    └── ...

public/
└── config/
    └── header-theme.json      — Theme config (sửa file này, reload trang nhận ngay)
```

---

## 💡 Ghi nhớ

- Sửa `header-theme.json` → client nhận trong tối đa 2 phút (hoặc ngay nếu có SignalR)
- Sửa `.env` / `nuxt.config.ts` → phải restart `npm run dev`
- Thêm property mới vào `runtimeConfig` → chạy `npx nuxi prepare`
- `import.meta.env` không hoạt động tốt với nested object trong `nuxt.config.ts`
