

<template>
  <div class="game-icon--svg-container tft">
    <svg class="svg--tft" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 315 315" xmlns="http://www.w3.org/2000/svg">
      <path d=" M 100.99 66.837 L 211.497 66.837 L 260.525 210.03 L 243.404 246.606 L 208.384 246.606 L 156.243 182.792 L 107.994 246.606 L 69.861 246.606 L 52.74 210.03 L 100.99 66.837 Z "></path>
      <path d=" M 51.907 252.108 L 41.067 252.054 L 31.557 233.267 L 11.845 233.267 L 81.643 40.378 L 150.51 40.378 L 156.748 49.717 L 88.196 49.717 L 25.152 223.929 L 37.261 223.929 L 51.907 252.108 Z "></path>
      <path d=" M 261.084 252.108 L 271.924 252.054 L 281.434 233.267 L 301.146 233.267 L 231.348 40.378 L 162.481 40.378 L 156.243 49.717 L 224.795 49.717 L 287.839 223.929 L 275.73 223.929 L 261.084 252.108 Z "></path>
      <path d=" M 187.738 251.618 L 175.455 251.618 L 157.678 230.043 L 120.795 274.622 L 23.526 274.622 L 14.669 257.501 L 0 257.501 L 4.669 248.163 L 20.358 248.163 L 29.207 265.283 L 116.422 265.283 L 157.398 215.794 L 187.738 251.618 Z "></path>
      <path d=" M 150.796 262.171 L 161.344 274.622 L 291.474 274.622 L 300.331 257.501 L 315 257.501 L 310.331 248.163 L 294.642 248.163 L 285.793 265.283 L 166.117 265.283 L 157.678 255.167 L 150.796 262.171 Z "></path>
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
  .game-icon--svg-container.tft {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    margin-top: -1px;
    margin-bottom: 0;

    .svg--tft {
      width: 35px;
      height: 35px;
      fill: #fff;
    }
  }
</style>