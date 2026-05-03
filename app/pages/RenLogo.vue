<template>
    <img  alt="Vuelogo" class="logo1" v-if="currentIndex >= 0 && currentIndex < msg.length" :src="`/img/logo/${msg[currentIndex].lineCode}_240x38.png`" @error="handleImageError(item)"/>
</template>

<script >

export default {
  name: 'RenLogo',
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
        this.currentIndex = (this.currentIndex + 1) % this.msg.length;
        }, 4000);
        },
      handleImageError(item) {
         console.log(item);
        },
    },
}

</script>