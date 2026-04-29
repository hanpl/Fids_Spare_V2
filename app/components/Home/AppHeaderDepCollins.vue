<template>
    <div class="headerdc" :style="bgStyle">
        <div class="logodc">
            <img class="logoahtdc" :src="theme.logoUrl" alt="" title="">
        </div>
        <div class="textdc">
            <img class="logoflightdc" :src="theme.iconDepUrl" alt="" title="">
            <p class="cl" :style="txtStyle">DEPARTURES</p>
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
.headerdc {
    background-color: #121441;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0.5rem;
    height: 8.5vh;
}
.logoahtdc {
    max-height: 100%;
    width: auto;
    vertical-align: middle;
}
.logodc  {
    height: 50%;
    width: 70vw;
    display: flex;
    align-content: center;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.logoflightdc  {
    height: 100%;
    width: 70vw;
}
.textdc {
    color: white ;
    font-weight: 100;
    font-size: large;
    margin-right: 9px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 30vw;
    height: 100%;
}
p.cl {
    /* margin-top: 0; */
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: center;
    /* height: 100%; */
    color: white;
    font-weight: 700;
    font-size: 4.5vw;
    /* padding-top: 7%; */
}


</style>
