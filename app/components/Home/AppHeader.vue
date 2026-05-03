<template>
    <div class="header" :style="bgStyle">
        <div class="logo">
           <a href="/"><img class="logoaht" :src="theme.logoCheckinUrl" alt="" title=""></a>
        </div>
    </div>
    
</template>

<script setup lang="ts">
const { theme, loadTheme, startPolling } = useHeaderTheme()

onMounted(async () => {
  await loadTheme()
  startPolling()
})

onUnmounted(() => {
  const { stopPolling } = useHeaderTheme()
  stopPolling()
})

const bgStyle = computed(() =>
  theme.value.bgColor ? { backgroundColor: theme.value.bgColor } : {}
)
</script>

<style>
.header {
    background-color: #2c3790;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0.5rem;
    max-height: 5vh;
}
.logoaht {
    max-height: 100%;
    width: auto;
}
.logo {
    height: 5vh;
}
.text {

    color: white;
    font-weight: 700;
    font-size: large;
    margin-left: 22px;
}
</style>
