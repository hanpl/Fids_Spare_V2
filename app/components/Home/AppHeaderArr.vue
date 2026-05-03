<template>
    <div class="headerArr" :style="bgStyle">
        <div class="logo">
            <img class="logoaht" :src="theme.ahtLogoUrl" alt="" title="">
        </div>
        <div class="text">
            <img class="logoaht" :src="theme.iconArrUrl" alt="" title="">
            <p :style="txtStyle">ARRIVALS</p>
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
const txtStyle = computed(() =>
  theme.value.textColor ? { color: theme.value.textColor } : {}
)
</script>

<style>
.headerArr {
    background-color: #121441;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0.5rem;
    height: 19vh;
}
.logoaht {
    max-height: 90%;
    width: auto;
    vertical-align: middle;
    padding-top: 1%;
}
.logo {
    height: 100%;
    width: 40vw;
}
.text {
    color: white;
    font-weight: 700;
    font-size: large;
    margin-left: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60vw;
    height: 100%;
}
p {
    /* margin-top: 0; */
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: center;
    /* height: 100%; */
    color: white;
    font-weight: 700;
    font-size: 7vw;
    /* padding-top: 7%; */
}
</style>
