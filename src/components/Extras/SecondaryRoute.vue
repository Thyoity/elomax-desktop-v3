<template>
  <div v-tippy="{ placement: 'top', arrow: true }" :content="'Rota 2ª: ' + routeName">
    <img :src="icons[value]" />
  </div>
</template>

<script>
export default {
  data(){
    return {
      icons: {
        top: require('../../assets/extras/top.png'),
        mid: require('../../assets/extras/mid.png'),
        jungle: require('../../assets/extras/jungle.png'),
        adc: require('../../assets/extras/adc.png'),
        support: require('../../assets/extras/support.png')
      }
    }
  },
  props: ['value'],
  computed: {
    routeName(){
      switch (this.value) {
        case 'top':
          return 'Topo'
        case 'mid':
          return 'Mid'
        case 'support':
          return 'Suporte'
        case 'jungle':
          return 'Selva'
        case 'adc':
          return 'ADC'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
