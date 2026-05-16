<template>
  <div class="loading-container">
    <div class="loading">
      <img style="width: 80px; height: 80px;" src="../assets/rammus-loading.png"/>
    </div>
    <p v-if="!text">Carregando...</p>
    <p v-else>{{ text }}</p>
  </div>
</template>
<script>
export default {
  props: ['text']
}
</script>
<style lang="scss" scoped>
  .loading-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .loading {
      animation: rotateRammus .15s infinite forwards;
    }
    > p {
      color: rgb(170, 170, 170);
      font-size: 13px;
      font-weight: 700;
      margin-right: 20px;
    }
    @keyframes rotateRammus {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-360deg);
      }
    }
    @-webkit-keyframes rotateRammus {
      0% {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(-50deg);
      }
      0% {
        transform: rotate(-360deg);
      }
    }
  }
</style>