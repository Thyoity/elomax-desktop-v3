

<template>
  <div class="svg-container" @click="$emit('click')" :class="{active: active}">
    <svg class="svg--wild-rift" xml:space="preserve" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" version="1.1" viewBox="0 0 125 125" width="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,118.045C5.674,94.933 12.237,72.708 19.292,50.977L18.386,62.163L22.917,48.128C27.463,43.312 30.327,39.505 32.11,36.346C32.11,36.346 18.888,80.135 14.501,91.114C17.292,88.994 21.926,82.413 28.493,73.885C30.656,71.076 33.743,68.815 36.3,65.866C36.818,72.799 37.606,79.701 39.454,86.412L59.559,38.806C65.111,37.212 74.799,22.969 85.066,6.955C70.796,37.276 57.425,67.813 42.536,99.936C40.834,103.609 38.499,107.098 36.771,110.821L31.204,81.663L14.563,101.612C14.563,101.612 10.094,107.576 7.667,110.315C5.26,113.031 0,118.045 0,118.045Z"></path>
      <path d="M65.58,51.02C71.09,48.402 77.67,46.318 85.39,44.805L82.671,48.819L85.519,50.373L78.398,67.334C98.568,58.558 109.737,50.237 112.45,42.345C113.426,35.501 100.439,35.527 87.332,35.612C71.01,36.157 57.466,37.626 45.123,39.497C55.137,35.384 70.626,32.054 89.921,29.268C109.322,27.164 122.55,29.279 124.492,39.108C125.112,50.964 108.26,61.687 85.001,71.995L125.01,106.565L96.395,90.381L102.999,97.243C93.182,90.673 84.003,83.592 75.291,76.139L66.227,101.645L61.064,94.322L68.946,71.477L65.181,67.738C67.305,67.866 68.834,67.055 69.853,66.298L77.155,51.02L65.58,51.02Z"></path>
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
    transition: all .3s;

    .svg--wild-rift {
      width: 30px;
      height: 30px;
      fill: #3e6082;
      transition: all .3s;
    }

    &:hover .svg--wild-rift,
    &.active .svg--wild-rift {
      fill: #85d0ff;
    }
  }
</style>