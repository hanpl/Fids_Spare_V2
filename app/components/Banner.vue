<template>
        <!-- <img alt="Vuelogo" class="hearder" :src="`/Banner/${image}`" /> -->
    <img class="hearder" v-if="currentIndex >= 0 && currentIndex < msg.length" :src="`/banner/${msg[currentIndex]}?timestamp=${new Date().getTime()}`" :alt="msg[currentIndex]" />
  </template>

<script >

export default {
  name: 'Banner',
  props: {
    msg: {
      type: Array,
      required: true
    }
  },
  data() {
      return {
        currentIndex: 0,
      };
    },
    mounted() {
        this.LoadBanner();
    },
    methods: {
     LoadBanner(){
        setInterval(() => {
        //console.log(this.currentIndex);
        this.currentIndex = (this.currentIndex + 1) % this.msg.length;
        }, 5000);
        }
    },
}


</script>