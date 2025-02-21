<template>
  <div class="animation-roll-parallax">
    <div class="g-scroll" id="g-scroll"></div>
    <div class="g-wrapper">
      <div class="g-mask"></div>
      <div class="g-inner">
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div class="g-item">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'AnimationRollParallax',
});
</script>
<style lang="less" scoped>
.animation-roll-parallax {
  width: 100%;
  height: 400px;
  display: flex;
  position: relative;
  overflow-y: auto;

  @property --phase {
    syntax: '<length>';
    inherits: false;
    initial-value: 15px;
  }

  .g-scroll {
    width: 100%;
    height: 1000vh;
    position: relative;
  }
  .g-wrapper {
    position: fixed;
    top: -20%;
    height: 100%;
    perspective: 200px;
    transform-style: preserve-3d;
  }

  .g-mask {
    position: fixed;
    height: 100%;
    // background: rgba(0,0,0,.5);
    backdrop-filter: blur(5px);
    transform: translateZ(0);
  }

  .g-inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    transform-style: preserve-3d;
    transform: translateY(calc(-50% + 100px)) translateZ(var(--phase)) rotateX(90deg);
    transform-origin: bottom center;
    animation-name: move;
    animation-duration: 1s;
    animation-timeline: box-move;
  }

  @scroll-timeline box-move {
    source: selector('#g-scroll');
    orientation: 'vertical';
  }

  .g-item {
    width: 300px;
    height: 200px;
    padding: 8px;
    box-sizing: border-box;
    color: #fff;
    background: #000;
    transform: rotateX(-90deg);
  }

  @keyframes move {
    0% {
      --phase: 0;
    }
    100% {
      --phase: calc(100vh + 100px);
    }
  }
}
</style>
