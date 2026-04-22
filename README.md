# AHT Asset Hub — Nuxt 3

Dashboard quản lý logo hãng hàng không và thư viện ảnh cho Da Nang Airport.

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa IP server API trong `.env`:

```
NUXT_PUBLIC_API_BASE=http://172.17.18.12:5050/api
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
pages/
  index.vue          → redirect
  login.vue          → trang đăng nhập
  airlines.vue       → quản lý hãng hàng không
  images.vue         → thư viện ảnh

components/
  airline/
    AirlineCard.vue       → card hiển thị hãng + logo grid
    AirlineFormModal.vue  → modal thêm/sửa hãng
    LogoAssignModal.vue   → modal chọn ảnh gán logo
  image/
    ImageCard.vue         → card ảnh trong grid
    ImageDetailModal.vue  → xem chi tiết, sửa, xóa ảnh
  shared/
    ToastContainer.vue    → thông báo toast
    ApiGuideModal.vue     → hướng dẫn API endpoints
    ApiRow.vue            → dòng endpoint

composables/
  useAuth.ts    → quản lý JWT token
  useToast.ts   → thông báo

middleware/
  auth.ts       → bảo vệ trang cần đăng nhập
```

## Đăng nhập mặc định

| Username | Password    |
|----------|-------------|
| admin    | Admin@2026! |
| editor   | Editor@2026!|
