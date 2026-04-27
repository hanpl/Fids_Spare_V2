# FIDS Spare V2 — Nuxt

Ứng dụng hiển thị màn hình FIDS cho Da Nang Airport (Gate / Checkin / Departures Collins), nhận dữ liệu từ API và cập nhật realtime qua SignalR.

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa endpoint trong `.env`:

```
NUXT_PUBLIC_API_BASE=https://localhost:7079/api
NUXT_PUBLIC_URL_HUB=https://localhost:7248/dashboardHub
```

## Chạy dev

```bash
npm run dev
# → http://localhost:3000
```

## Build production

```bash
npm run build
npm run preview
```

## Cấu trúc

```
app/pages/
  index.vue               → chọn mode hiển thị theo cấu hình từ API
  gate.vue                → màn hình Gate full-screen
  checkin.vue             → màn hình Checkin full-screen
  Departures_Collins.vue  → màn hình departures 2 cột
  login.vue               → trang đăng nhập (chưa dùng trong scope hiện tại)

app/components/
  AirlineLogo.vue         → hiển thị logo hãng theo line code
  Home/*                  → header/footer cho từng template màn hình

app/composables/
  useAirlineLogos.ts      → cache logo theo location
  useAuth.ts              → auth helper (không bắt buộc cho luồng FIDS hiện tại)
  useToast.ts             → toast helper
```
