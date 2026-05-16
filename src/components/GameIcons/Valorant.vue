

<template>
  <div class="game-icon--svg-container valorant">
    <svg class="svg--valorant" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 315 315" xmlns="http://www.w3.org/2000/svg">
      <path d=" M 0 27.883 L 0 152.978 L 107.01 287.117 L 209.498 287.117 L 0 27.883 Z "></path>
      <path  d=" M 315 27.883 L 315 152.978 L 280.335 198.194 L 177.847 198.194 L 315 27.883 Z "></path>
    </svg>
  </div>
</template>

<script>
export default {
  props: ['active'],
  data(){
    return {}
  }
}
</script>

<style lang="scss" scoped>
  .game-icon--svg-container.valorant {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    margin-top: -5px;
    margin-bottom: 0;

    .svg--valorant {
      width: 28px;
      height: 28px;
      position: relative;
      top: 2px;
      fill: #fff;
    }
  }
</style>