<template>
  <div class="headerArr">
    <div class="logo">
      <img class="logoaht" :src="`${config.public.apiBase}/images/logo/AHTLogo.png`" alt="AHT Logo">
    </div>
    <div class="text">
      <img class="logoaht" :src="`${config.public.apiBase}/images/logo/Icon-Arrival.png`" alt="Arrival">
      <p>ARRIVALS</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<style>
.headerArr {
  background-color: #121441;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2px 0.5rem;
  height: 22vh;
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
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 7vw;
}
</style>
