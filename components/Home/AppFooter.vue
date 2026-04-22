<template>
  <div class="footer">
    <p class="date">{{ date }}</p>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { ref, onMounted, onUnmounted } from 'vue'

const date = ref('')
const timerId = ref<number | null>(null)

const updateDate = () => {
  date.value = format(new Date(), 'dd MMMM yyyy | HH:mm').toUpperCase()
}

onMounted(() => {
  updateDate()
  timerId.value = window.setInterval(updateDate, 1000)
})

onUnmounted(() => {
  if (timerId.value !== null) clearInterval(timerId.value)
})
</script>

<style>
.footer {
  background-color: #36c0c7;
  left: 0 !important;
  width: 100vw;
  height: 6vh;
  position: fixed;
  bottom: 0;
  padding: 5px;
}
p.date {
  color: #121542;
  padding-right: 4vw;
  font-size: 4vh;
  float: right;
  padding-top: 1.8vh;
  font-weight: 500;
}
</style>
