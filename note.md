# FIDS Spare V2 — Ghi chú tiến độ

> Cập nhật: 2026-04-29 15:30

---

## ✅ Đã hoàn thành

### 1. Header Theme — Chuyển từ `.env` sang JSON config

**Vấn đề:** Giá trị theme trong `.env` chỉ được đọc khi Nuxt server khởi động. Sửa `.env` phải restart `npm run dev`, reload trang không nhận giá trị mới.

**Giải pháp:**
- Tạo file `public/config/header-theme.json` chứa cấu hình theme: logo, màu, icon.
- Sửa `app/composables/useHeaderTheme.ts` để fetch JSON thay vì chỉ đọc runtimeConfig.
- Thêm cache-busting `?_t=Date.now()` để tránh browser cache.
- Thêm polling theme mỗi **2 phút**.
- Thứ tự ưu tiên: **JSON config > runtimeConfig/.env > DEFAULTS**.

**Files đã sửa:**
- `public/config/header-theme.json`
- `app/composables/useHeaderTheme.ts`
- `nuxt.config.ts`
- `.env`

---

### 2. Thêm `ahtLogoUrl` vào HeaderTheme

- Thêm property `ahtLogoUrl` vào interface `HeaderTheme`.
- Thêm vào `DEFAULTS`, `mergeTheme()`, `nuxt.config.ts`, `header-theme.json`.
- Đã xử lý lỗi TypeScript: `ahtLogoUrl does not exist in type RuntimeValue...`.

> **Lưu ý:** Mỗi lần thêm/xóa property trong `runtimeConfig`, cần chạy `npx nuxi prepare` hoặc restart dev server.

---

### 3. AirlineLogo — Đồng bộ theo `location`

**Vấn đề:** Logo hãng bay không dùng chung cache/location cho tất cả page. Riêng `DeparturesT1In.vue` và `DeparturesT1Out.vue` cần location `Stand`, không phải `FIDs`.

**Giải pháp:**
- Sửa `app/components/AirlineLogo.vue` để nhận prop `location`.
- `AirlineLogo` gọi `useAirlineLogos(props.location ?? 'FIDs')`.
- Các page T1 truyền `location="Stand"`.
- Các page FIDS/Collins/Sorting dùng `location="FIDs"`.
- `gate.vue` dùng `FullScreen`.

**Mapping location hiện tại:**

| Page | Location |
|---|---|
| `DeparturesT1In.vue`, `DeparturesT1Out.vue` | `Stand` |
| `gate.vue` | `FullScreen` |
| Arrival/Departure/Collins/Sorting còn lại | `FIDs` |

---

### 4. Auto-refresh cho 100+ FIDS client

**Vấn đề:** Khi đổi logo/theme trên server, các client không tự cập nhật nếu không reload thủ công.

**Giải pháp — 2 tầng:**

#### Tầng 1: Polling tự động
- `useHeaderTheme` polling mỗi **2 phút**.
- `useAirlineLogos` đã thêm:
  - `reloadAll()` — force refresh, bỏ cache cũ.
  - `startPolling()` — polling logo mỗi **10 phút**.
  - `stopPolling()` — dừng interval khi rời page.

#### Tầng 2: SignalR broadcast
- Tạo `app/composables/useFidsSignalR.ts`.
- Tạo `app/plugins/fids-signalr.client.ts` để auto-connect cho client.
- Lắng nghe 3 event:
  - `ReloadPage` → reload toàn trang.
  - `ReloadTheme` → load lại theme JSON.
  - `ReloadLogos` → load lại airline logos.

**Files đã tạo/sửa:**
- `app/composables/useAirlineLogos.ts`
- `app/composables/useFidsSignalR.ts`
- `app/plugins/fids-signalr.client.ts`

---

### 5. Đã gọi `startPolling()` logo trong các page

Các page đã được đồng bộ theo pattern:

```ts
const { loadAll, startPolling, stopPolling } = useAirlineLogos('FIDs')

onMounted(async () => {
  await loadAll()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
```

**Đã sửa:**
- `Arrival.vue`
- `Arrival85.vue`
- `Arrival_Collins.vue`
- `ArrivalClaim.vue`
- `DepArr_Collins.vue`
- `Departures_Collins.vue`
- `DeparturesA_Collins.vue`
- `DeparturesB_Collins.vue`
- `DeparturesDep_Collins.vue`
- `DeparturesT1In.vue` — dùng `Stand`
- `DeparturesT1Out.vue` — dùng `Stand`
- `SortingArr.vue`
- `SortingDep.vue`
- `gate.vue` — dùng `FullScreen`

---

### 6. Bỏ hardcode API URL ở các page đã sửa

Các page mới sửa đã chuyển từ hardcode:

```ts
http://172.17.18.12:8085
http://172.17.18.12:8084/dashboardHub
```

sang dùng:

```ts
const config = useRuntimeConfig()
`${config.public.apiBase}`
`${config.public.urlHub}`
```

**Đã áp dụng cho:**
- `Arrival_Collins.vue`
- `ArrivalClaim.vue`
- `DeparturesDep_Collins.vue`
- `SortingArr.vue`
- `SortingDep.vue`

---

### 7. `index.vue`

Đã bật lại import cho:

```ts
import SortingArr from './SortingArr.vue';
import SortingDep from './SortingDep.vue';
import ArrClaim from './ArrivalClaim.vue';
```

`index.vue` hiện có thể render các mode:
- `SortingArr`
- `SortingDep`
- `ArrClaim`
- các page FIDS khác theo `FidsLocation.description`

---

### 8. Validation đã chạy

Sau các nhóm chỉnh sửa, đã chạy nhiều lần:

```bash
npx nuxi typecheck
```

Kết quả gần nhất: **Exit code 0**.

Có warning:

```txt
'git' is not recognized as an internal or external command
```

Warning này không làm fail typecheck.

---

## 🔧 Đang làm dở / Cần tiếp tục

### 1. Backend C# — Thêm SignalR broadcast

Backend cần thêm `SendAsync` khi admin thay đổi theme/logo:

```csharp
// Khi admin đổi header theme
await Clients.All.SendAsync("ReloadTheme");

// Khi admin đổi airline logo
await Clients.All.SendAsync("ReloadLogos");

// Khi cần reload toàn trang
await Clients.All.SendAsync("ReloadPage");
```

Nếu backend chưa phát event thì client vẫn cập nhật bằng polling, nhưng không realtime ngay lập tức.

---

### 2. Kiểm tra plugin SignalR hoạt động thực tế

Cần test trên browser/client thật:
- Mở console.
- Kiểm tra log dạng `[FidsSignalR] Connected to hub`.
- Test backend broadcast:
  - `ReloadTheme`
  - `ReloadLogos`
  - `ReloadPage`

Nếu backend hub chưa sẵn sàng, plugin sẽ retry, app vẫn chạy bình thường.

---

### 3. Kiểm tra các page chưa được rà soát kỹ

Một số page vẫn có thể còn hardcode URL/logo hoặc chưa dùng `AirlineLogo`:
- `checkin.vue`
- `admin.vue`
- `admin_counter.vue`
- `Departures.vue` nếu còn sử dụng
- `DeparturesLED.vue` nếu còn sử dụng
- các page phụ khác trong `app/pages`

Cần grep tiếp:

```bash
rg "172.17.18.12|/img/logo|/img/Logo_785x225|NodeJS.Timeout" app/pages
```

---

### 4. Xung đột SignalR connection

Một số page (`gate.vue`, `checkin.vue`, `admin_counter.vue`, `SortingArr.vue`, `SortingDep.vue`) có hoặc từng có connection riêng tới `dashboardHub`.
Plugin `fids-signalr.client.ts` tạo thêm 1 connection nữa.

**Hiện tại:** chấp nhận 2 connection song song:
- connection riêng page: phục vụ data cũ nếu cần.
- connection plugin: phục vụ reload commands.

**Tối ưu sau:** gộp thành 1 connection nếu muốn giảm resource.

---

### 5. Kiểm tra UI thực tế sau khi đổi `AirlineLogo`

Cần mở các page đã sửa để kiểm tra kích thước logo có đúng không:
- `SortingArr.vue`
- `SortingDep.vue`
- `ArrivalClaim.vue`
- `Arrival_Collins.vue`
- `DeparturesDep_Collins.vue`

Lý do: trước đây dùng `<img>` trực tiếp, hiện dùng component `AirlineLogo`; CSS có thể cần tinh chỉnh thêm nếu logo bị lệch hoặc sai size.

---

## 📁 Cấu trúc file quan trọng

```txt
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
    ├── Arrival_Collins.vue, ArrivalClaim.vue
    ├── DepArr_Collins.vue
    ├── Departures_Collins.vue
    ├── DeparturesA_Collins.vue, DeparturesB_Collins.vue
    ├── DeparturesDep_Collins.vue
    ├── DeparturesT1In.vue, DeparturesT1Out.vue — location='Stand'
    ├── SortingArr.vue, SortingDep.vue
    ├── gate.vue — location='FullScreen'
    └── ...

public/
├── config/
│   └── header-theme.json      — Theme config động
└── logos/
    └── AHTLogo.png            — Logo AHT mới dùng ở Sorting pages
```

---

## 💡 Ghi nhớ

- Sửa `header-theme.json` → client nhận trong tối đa 2 phút hoặc ngay nếu có SignalR `ReloadTheme`.
- Đổi airline logo → client nhận trong tối đa 10 phút hoặc ngay nếu có SignalR `ReloadLogos`.
- Sửa `.env` / `nuxt.config.ts` → phải restart `npm run dev`.
- Thêm property mới vào `runtimeConfig` → chạy `npx nuxi prepare`.
- `DeparturesT1In.vue` và `DeparturesT1Out.vue` dùng logo location `Stand`.
- `gate.vue` dùng logo location `FullScreen`.
- Các page FIDS còn lại dùng logo location `FIDs`.
- User vừa đổi logo sorting pages sang `/logos/AHTLogo.png`.
