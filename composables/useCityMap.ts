interface CityEntry {
  codeAirport: string
  nameAirport: string
  countries: string
}

export const useCityMap = () => {
  const config = useRuntimeConfig()
  const cityMap = ref<CityEntry[]>([])

  const loadCityMap = async () => {
    try {
      const data = await $fetch<CityEntry[]>(`${config.public.apiBase}/api/Countries`)
      cityMap.value = data
    } catch (err) {
      console.error('Failed to load city map:', err)
    }
  }

  const getFullCityName = (shortCode: string): string => {
    const airport = cityMap.value.find(a => a.codeAirport === shortCode)
    return airport ? airport.nameAirport : shortCode
  }

  return { cityMap, loadCityMap, getFullCityName }
}
