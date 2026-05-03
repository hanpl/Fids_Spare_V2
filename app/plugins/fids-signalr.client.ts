/**
 * Plugin FIDS SignalR
 *
 * Tự động kết nối SignalR hub cho tất cả client-side pages.
 * Lắng nghe các lệnh broadcast từ backend:
 *   - "ReloadPage"  → reload toàn trang
 *   - "ReloadTheme" → fetch lại header-theme.json
 *   - "ReloadLogos" → fetch lại airline logos
 *
 * Plugin chạy client-side only (.client.ts), tự kết nối khi app mount.
 */
export default defineNuxtPlugin(() => {
  const { connectFidsHub } = useFidsSignalR()

  // Kết nối khi app sẵn sàng trên client
  connectFidsHub()
})
