export interface HeaderTheme {
  logoUrl: string
  ahtLogoUrl: string
  iconDepUrl: string
  iconArrUrl: string
  logoCheckinUrl: string
  bgColor: string
  textColor: string
}

const DEFAULTS: HeaderTheme = {
  logoUrl: '/logos/logo_dit.png',
  ahtLogoUrl: '/logos/AHTLogo.png',
  iconDepUrl: '/logos/Icon-Departure.png',
  iconArrUrl: '/logos/Icon-Arrival.png',
  logoCheckinUrl: '/logos/AHT.png',
  bgColor: '',
  textColor: '',
}

/**
 * Interval polling mặc định: 2 phút.
 * Mỗi 2 phút client tự fetch header-theme.json để phát hiện thay đổi.
 * Nếu backend gửi SignalR "ReloadTheme" thì fetch ngay lập tức.
 */
const POLL_INTERVAL_MS = 2 * 60 * 1000

export const useHeaderTheme = () => {
  const config = useRuntimeConfig()
  const theme = useState<HeaderTheme>('header_theme', () => ({ ...DEFAULTS }))
  const loaded = useState<boolean>('header_theme_loaded', () => false)
  const loading = useState<boolean>('header_theme_loading', () => false)
  const pollId = useState<ReturnType<typeof setInterval> | null>('header_theme_poll', () => null)

  /**
   * Hàm gộp dữ liệu theo ưu tiên: JSON Config > Runtime Config > Defaults
   */
  function mergeTheme(jsonData?: Partial<HeaderTheme>) {
    const local = config.public.headerTheme as Partial<HeaderTheme>

    theme.value = {
      logoUrl: jsonData?.logoUrl || local.logoUrl || DEFAULTS.logoUrl,
      ahtLogoUrl: jsonData?.ahtLogoUrl || local.ahtLogoUrl || DEFAULTS.ahtLogoUrl,
      iconDepUrl: jsonData?.iconDepUrl || local.iconDepUrl || DEFAULTS.iconDepUrl,
      iconArrUrl: jsonData?.iconArrUrl || local.iconArrUrl || DEFAULTS.iconArrUrl,
      logoCheckinUrl: jsonData?.logoCheckinUrl || local.logoCheckinUrl || DEFAULTS.logoCheckinUrl,
      bgColor: jsonData?.bgColor || local.bgColor || DEFAULTS.bgColor,
      textColor: jsonData?.textColor || local.textColor || DEFAULTS.textColor,
    }
  }

  async function loadTheme() {
    if (loading.value) return
    loading.value = true

    try {
      // Đọc theme từ file public/config/header-theme.json.
      // Thêm query _t để tránh browser cache, giúp reload trang nhận giá trị JSON mới.
      const data = await $fetch<Partial<HeaderTheme>>('/config/header-theme.json', {
        query: { _t: Date.now() },
      })

      mergeTheme(data)
      loaded.value = true
    } catch (err: any) {
      mergeTheme()
      loaded.value = true
      console.warn('[useHeaderTheme] JSON config not available, using runtime config/defaults', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Bắt đầu polling tự động mỗi 2 phút.
   * Tất cả client sẽ tự phát hiện thay đổi mà không cần manual reload.
   */
  function startPolling(intervalMs: number = POLL_INTERVAL_MS) {
    stopPolling()
    pollId.value = setInterval(loadTheme, intervalMs)
  }

  function stopPolling() {
    if (pollId.value) {
      clearInterval(pollId.value)
      pollId.value = null
    }
  }

  /**
   * Đăng ký lắng nghe event "ReloadTheme" từ SignalR hub.
   * Khi admin đổi theme và backend broadcast "ReloadTheme",
   * tất cả client sẽ fetch lại JSON ngay lập tức (không cần chờ polling).
   *
   * Cách dùng trong page đã có hubConnection:
   *   const { listenSignalR } = useHeaderTheme()
   *   listenSignalR(hubConnection.value)
   *
   * Backend cần gọi:
   *   await Clients.All.SendAsync("ReloadTheme")
   */
  function listenSignalR(hubConnection: any) {
    if (!hubConnection) return

    // Tránh đăng ký trùng
    hubConnection.off('ReloadTheme')
    hubConnection.on('ReloadTheme', () => {
      console.log('[useHeaderTheme] Received ReloadTheme from SignalR, fetching new theme...')
      loadTheme()
    })
  }

  return { theme, loaded, loading, loadTheme, startPolling, stopPolling, listenSignalR }
}