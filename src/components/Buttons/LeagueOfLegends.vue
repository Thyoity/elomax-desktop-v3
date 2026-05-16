

<template>
  <div class="svg-container" @click="$emit('click')" :class="{active: active}">
    <svg class="svg--league-of-legends" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 315 315" xmlns="http://www.w3.org/2000/svg">
      <path d=" M 135.5 12 L 135.5 271 L 279.5 271 L 252.5 303 L 72.5 303 L 85.062 285 L 85.062 36.422 L 70.5 12 L 135.5 12 Z "></path>
      <path d=" M 255.603 258 C 275.165 235.313 287 205.778 287 173.5 C 287 102.027 228.973 44 157.5 44 C 154.305 44 151.137 44.116 148 44.344 L 148 44.344 L 148 63.403 C 151.131 63.136 154.3 63 157.5 63 C 218.487 63 268 112.513 268 173.5 C 268 207.382 252.717 237.723 228.675 258 L 255.603 258 Z  M 242.694 271 C 219.917 290.922 190.108 303 157.5 303 C 130.647 303 105.693 294.809 85 280.792 L 85 280.792 L 85 256.865 C 99.014 269.065 116.13 277.794 135 281.703 L 135 290 L 148 290 L 148 283.597 C 151.131 283.864 154.3 284 157.5 284 C 176.299 284 194.008 279.295 209.513 271 L 242.694 271 Z  M 135 45.951 C 116.733 49.157 99.78 56.196 85 66.208 L 85 66.208 L 85 90.135 L 85 90.135 C 99.014 77.935 116.13 69.206 135 65.297 L 135 45.951 L 135 45.951 Z  M 72 76.269 C 45.029 100.008 28 134.781 28 173.5 L 28 173.5 C 28 212.219 45.029 246.992 72 270.731 L 72 243.472 C 56.379 224.412 47 200.043 47 173.5 L 47 173.5 C 47 146.957 56.379 122.588 72 103.528 L 72 76.269 L 72 76.269 L 72 76.269 Z "></path>
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

<style lang="scss">
  .svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-top: -12px;
    margin-bottom: 0;
    cursor: pointer;

    .svg--league-of-legends {
      width: 26px;
      height: 26px;
      position: relative;
      top: 2px;
      fill: #3e6082;
      transition: all .3s;
    }

    &:hover .svg--league-of-legends,
    &.active .svg--league-of-legends {
      fill: #85d0ff;
    }
  }
</style>