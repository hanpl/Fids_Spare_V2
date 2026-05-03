<template>
  <div v-if="currentIndex >= 0 && currentIndex < msg.length">{{msg[currentIndex].flight}}</div>
    
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
    },
}

</script>