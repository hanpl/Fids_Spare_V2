<template>
  <img
    v-if="logoUrl"
    :src="logoUrl"
    :alt="lineCode"
    class="Vuelogocl"
    @error="onError" />

  <!-- Fallback: hiển thị logo mặc định nếu không có ảnh -->
  <img
    v-else
    src="/img/trans.png"
    :alt="lineCode"
    class="Vuelogocl" />
</template>

<script setup lang="ts">
const props = defineProps<{
  lineCode: string
  location?: string   // mặc định 'FIDs', có thể truyền 'HalfScreen', 'Web'...
}>()

const { getLogoUrl } = useAirlineLogos()

const logoUrl = computed(() => {
  const url = getLogoUrl(props.lineCode)
  console.log(`[AirlineLogo] lineCode: ${props.lineCode} → url: ${url || 'KHÔNG CÓ'}`)
  return url
})

function onError(e: Event) {
  // Ẩn ảnh lỗi — v-else sẽ hiển thị fallback
  console.warn(`[AirlineLogo] Lỗi load ảnh: ${logoUrl.value}`)
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}
</script>
