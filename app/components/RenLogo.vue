<template>
    <img  alt="Vuelogo" class="logo1" v-if="currentIndex >= 0 && currentIndex < msg.length" :src="`/logo/${msg[currentIndex].lineCode}.png?timestamp=${new Date().getTime()}`" @error="handleImageError(item)"/>
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
        //console.log(this.currentIndex);
        this.currentIndex = (this.currentIndex + 1) % this.msg.length;
        }, 4000);
        },
      handleImageError(item) {
        //msg[currentIndex].lineCode = 'AHT'; // Thay đổi tên hình thay thế tại đây
         console.log(item);
        },
    },
}
// defineProps({
//   msg: {
//     type: Array,
//     required: true
//   }, });
//let currentIndex = 0;

</script>