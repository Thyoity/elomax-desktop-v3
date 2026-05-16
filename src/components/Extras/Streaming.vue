<template>
  <div v-tippy="{ placement: 'top', arrow: true }" content="Streaming">
    <img :src="icon" />
  </div>
</template>

<script>
export default {
  data(){
    return {
      icon: require('../../assets/extras/streaming.png')
    }
  },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
