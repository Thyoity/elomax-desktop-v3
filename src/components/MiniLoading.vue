<template>
  <div class="mini-loading" :style="{width: containerWidth + 'px', height: containerHeight + 'px'}">
    <div class="loader" :style="{'font-size': size + 'px'}">Loading...</div>
  </div>
</template>
<script>
export default {
  props: ['containerWidth', 'containerHeight', 'size']
}
</script>
<style lang="scss" scoped>
  .mini-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0px solid rgba(255, 255, 255, 0.2);
    width: 240px;
    height: 240px;
    float: left;
    position: relative;
    overflow: hidden;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    top: -1px;
  }
  .loader,
  .loader:before,
  .loader:after {
    background: #ffffff;
    -webkit-animation: load1 1s infinite ease-in-out;
    animation: load1 1s infinite ease-in-out;
    width: 1em;
    height: 4em;
  }
  .loader {
    color: #ffffff;
    text-indent: -9999em;
    position: relative;
    font-size: 11px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
    top: 4px;
  }
  .loader:before,
  .loader:after {
    position: absolute;
    top: 0;
    content: '';
  }
  .loader:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }
  .loader:after {
    left: 1.5em;
  }
  @-webkit-keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
  @keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }

</style>