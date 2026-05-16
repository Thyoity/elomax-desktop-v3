<template>
  <div v-tippy="{ placement: 'top', arrow: true }" :content="'Horário restrito: ' + value">
    <img :src="icon" />
  </div>
</template>

<script>
export default {
  data(){
    return {
      icon: require('../../assets/extras/restricted-time.png')
    }
  },
  props: ['value']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
