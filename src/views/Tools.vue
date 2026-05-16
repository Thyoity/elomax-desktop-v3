<template>
  <div class="about">
    <h1>This is an about page</h1>
    <AppLoading></AppLoading>
  </div>
</template>
<script>
import LoadingComponent from '../components/Loading'
export default {
  name: 'Home',
  components: {
    "AppLoading": LoadingComponent
  },
  data(){
    return {
      show: false
    }
  },
  methods: {
    toggleWow(){
      this.show = !this.show
    }
  }
}
</script>
<style lang="scss">

</style>