/**
 * useAirlineLogos
 * Load logo hãng từ AHTAssetHub theo location cụ thể.
 * Cache riêng cho từng location, dùng useState để share giữa các component.
 *
 * Dùng:
 *   const { loadAll, getLogoUrl } = useAirlineLogos('FIDs')
 *   const { loadAll, getLogoUrl } = useAirlineLogos('HalfScreen')
 */
export const useAirlineLogos = (location: string = 'FIDs') => {
  console.log(`[useAirlineLogos] initialized with location: "${location}"`)
  const config    = useRuntimeConfig()
  const ASSET_API = config.public.apiBase

  // Cache riêng theo từng location
  const logoCache  = useState<Record<string, string>>(`logos_${location}`, () => ({}))
  const cacheReady = useState<boolean>(`logos_${location}_ready`,   () => false)
  const loading    = useState<boolean>(`logos_${location}_loading`, () => false)

  async function loadAll() {
  if (cacheReady.value || loading.value) return
  loading.value = true
  console.log(`[useAirlineLogos:${location}] Fetching → ${ASSET_API}/airlines`)

  try {
    const res = await $fetch<any>(`${ASSET_API}/airlines`)

    // API trả về flat array, không có wrapper { data: [] }
    const rows: any[] = Array.isArray(res) ? res : (res?.data || [])
    console.log(`[useAirlineLogos:${location}] Total rows: ${rows.length}`)

    const map: Record<string, string> = {}

    rows.forEach(row => {
      // Bỏ qua record không có logo (Id1 = null)
      if (!row.Id1 || !row.ImageUrl) return

      // Chỉ lấy đúng location cần thiết
      if (row.Location !== location) return

      const code = (row.LineCode || '').toUpperCase()
      if (!code) return

      map[code] = row.ImageUrl
      console.log(`[useAirlineLogos:${location}] ✓ ${code} → ${row.ImageUrl}`)
    })

    logoCache.value  = map
    cacheReady.value = true
    console.log(`[useAirlineLogos:${location}] ✅ Done — ${Object.keys(map).length} logos`)

  } catch (err: any) {
    console.error(`[useAirlineLogos:${location}] ❌ Error:`, err?.message || err)
  }

  loading.value = false
}

  function getLogoUrl(lineCode: string): string {
    if (!lineCode) return ''
    return logoCache.value[lineCode.toUpperCase()] || ''
  }

  return { loadAll, getLogoUrl, cacheReady, loading }
}