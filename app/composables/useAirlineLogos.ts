/**
 * useAirlineLogos
 * Load logo hãng từ AHTAssetHub theo location cụ thể.
 * Cache riêng cho từng location, dùng useState để share giữa các component.
 *
 * Dùng:
 *   const { loadAll, getLogoUrl } = useAirlineLogos('FIDs')
 *   const { loadAll, getLogoUrl } = useAirlineLogos('Stand')
 *
 * Force refresh (bỏ qua cache):
 *   const { reloadAll } = useAirlineLogos('FIDs')
 *   await reloadAll()
 */

/** Interval polling logo: mỗi 10 phút */
const LOGO_POLL_INTERVAL_MS = 10 * 60 * 1000

export const useAirlineLogos = (location: string = 'FIDs') => {
  const config    = useRuntimeConfig()
  const ASSET_API = config.public.apiBase

  // Cache riêng theo từng location
  const logoCache  = useState<Record<string, string>>(`logos_${location}`, () => ({}))
  const cacheReady = useState<boolean>(`logos_${location}_ready`,   () => false)
  const loading    = useState<boolean>(`logos_${location}_loading`, () => false)
  const pollId     = useState<ReturnType<typeof setInterval> | null>(`logos_${location}_poll`, () => null)

  /**
   * Load tất cả logo cho location này.
   * Nếu đã load rồi (cacheReady = true), sẽ bỏ qua.
   * Dùng reloadAll() nếu muốn force refresh.
   */
  async function loadAll() {
    if (cacheReady.value || loading.value) return
    await _fetchLogos()
  }

  /**
   * Force reload logo, bỏ qua cache.
   * Dùng khi nhận SignalR "ReloadLogos" hoặc khi cần cập nhật logo mới.
   */
  async function reloadAll() {
    cacheReady.value = false
    await _fetchLogos()
  }

  async function _fetchLogos() {
    if (loading.value) return
    loading.value = true

    try {
      const res = await $fetch<any>(`${ASSET_API}/airlines`)

      // API trả về flat array, không có wrapper { data: [] }
      const rows: any[] = Array.isArray(res) ? res : (res?.data || [])

      const map: Record<string, string> = {}

      rows.forEach(row => {
        // Bỏ qua record không có logo (Id1 = null)
        if (!row.Id1 || !row.ImageUrl) return

        // Chỉ lấy đúng location cần thiết
        if (row.Location !== location) return

        const code = (row.LineCode || '').toUpperCase()
        if (!code) return

        map[code] = row.ImageUrl
      })

      logoCache.value  = map
      cacheReady.value = true

    } catch (err: any) {
      console.error(`[useAirlineLogos:${location}] ❌ Error:`, err?.message || err)
    }

    loading.value = false
  }

  function getLogoUrl(lineCode: string): string {
    if (!lineCode) return ''
    return logoCache.value[lineCode.toUpperCase()] || ''
  }

  /**
   * Bắt đầu polling logo tự động (mặc định mỗi 10 phút).
   */
  function startPolling(intervalMs: number = LOGO_POLL_INTERVAL_MS) {
    stopPolling()
    pollId.value = setInterval(reloadAll, intervalMs)
  }

  function stopPolling() {
    if (pollId.value) {
      clearInterval(pollId.value)
      pollId.value = null
    }
  }

  return { loadAll, reloadAll, getLogoUrl, cacheReady, loading, startPolling, stopPolling }
}