<template>
  <div v-tippy="{ placement: 'top', arrow: true }" content="Taxa de MMR Buffado">
    <img :src="icon" />
  </div>
</template>

<script>
export default {
  data(){
    return {
      icon: require('../../assets/extras/mmr-tax-buffed.png')
    }
  },
  props: ['value']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
