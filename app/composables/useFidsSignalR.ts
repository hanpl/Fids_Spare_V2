import * as signalR from '@microsoft/signalr'

/**
 * useFidsSignalR
 *
 * Composable điều khiển chung cho tất cả FIDS client qua SignalR.
 * Kết nối tới dashboardHub và lắng nghe các lệnh broadcast từ backend:
 *
 *   - "ReloadPage"   → window.location.reload()  — reload toàn trang
 *   - "ReloadTheme"  → fetch lại header-theme.json
 *   - "ReloadLogos"  → fetch lại airline logos từ API
 *
 * Cách dùng trong page:
 *   const { connectFidsHub, disconnectFidsHub } = useFidsSignalR()
 *
 *   onMounted(async () => {
 *     await connectFidsHub()
 *   })
 *
 *   onUnmounted(() => {
 *     disconnectFidsHub()
 *   })
 *
 * Backend (C#) gửi lệnh:
 *   await Clients.All.SendAsync("ReloadPage");
 *   await Clients.All.SendAsync("ReloadTheme");
 *   await Clients.All.SendAsync("ReloadLogos");
 */
export const useFidsSignalR = () => {
  const config = useRuntimeConfig()

  const hub = useState<signalR.HubConnection | null>('fids_hub', () => null)
  const connected = useState<boolean>('fids_hub_connected', () => false)
  const reconnectTimer = useState<ReturnType<typeof setInterval> | null>('fids_hub_reconnect', () => null)

  async function connectFidsHub() {
    // Nếu đã kết nối, không kết nối lại
    if (hub.value && connected.value) return

    hub.value = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.urlHub}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // ─── Đăng ký listeners ──────────────────────────────────────────

    // 1. ReloadPage: reload toàn trang (đổi layout, page, code mới...)
    hub.value.on('ReloadPage', () => {
      console.log('[FidsSignalR] Received ReloadPage — reloading...')
      window.location.reload()
    })

    // 2. ReloadTheme: fetch lại header-theme.json
    hub.value.on('ReloadTheme', () => {
      console.log('[FidsSignalR] Received ReloadTheme — fetching theme...')
      const { loadTheme } = useHeaderTheme()
      loadTheme()
    })

    // 3. ReloadLogos: fetch lại airline logos từ API
    hub.value.on('ReloadLogos', () => {
      console.log('[FidsSignalR] Received ReloadLogos — fetching logos...')
      // Reload tất cả các location phổ biến
      const locations = ['FIDs', 'Stand', 'FullScreen', 'HalfScreen']
      locations.forEach(loc => {
        const { reloadAll } = useAirlineLogos(loc)
        reloadAll()
      })
    })

    // ─── Events ─────────────────────────────────────────────────────

    hub.value.onreconnected(() => {
      connected.value = true
      _stopReconnectTimer()
      console.log('[FidsSignalR] Reconnected')
    })

    hub.value.onclose(() => {
      connected.value = false
      _startReconnectTimer()
      console.warn('[FidsSignalR] Connection closed, will retry...')
    })

    // ─── Start ──────────────────────────────────────────────────────

    try {
      await hub.value.start()
      connected.value = true
      _stopReconnectTimer()
      console.log('[FidsSignalR] Connected to hub')
    } catch (err) {
      console.error('[FidsSignalR] Connect failed:', err)
      _startReconnectTimer()
    }
  }

  function disconnectFidsHub() {
    _stopReconnectTimer()
    hub.value?.stop()
    connected.value = false
  }

  function _startReconnectTimer() {
    _stopReconnectTimer()
    reconnectTimer.value = setInterval(async () => {
      try {
        if (hub.value) {
          try { await hub.value.stop() } catch {}
        }
        await connectFidsHub()
      } catch (err) {
        console.error('[FidsSignalR] Reconnect failed:', err)
      }
    }, 30000)
  }

  function _stopReconnectTimer() {
    if (reconnectTimer.value) {
      clearInterval(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  return { hub, connected, connectFidsHub, disconnectFidsHub }
}
