<template>
  <div class="animation-surround">
    <h3>环绕动画</h3>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'AnimationSurround',
});
</script>
<style lang="less" scoped>
.animation-surround {
  width: 100%;

  width: 200px;
  height: 280px;
  background: #07182e;
  position: relative;
  display: flex;
  place-content: center;
  place-items: center;
  overflow: hidden;
  border-radius: 20px;

  h3 {
    z-index: 1;
    color: white;
    font-size: 1em;
  }

  &::before {
    content: '';
    position: absolute;
    width: 100px;
    background-image: linear-gradient(180deg, rgb(16, 160, 28), rgb(255, 0, 85));
    height: 120%;
    animation: rotateDong 3s linear infinite;
    transition: all 0.2s linear;
  }

  @keyframes rotateDong {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  &::after {
    content: '';
    position: absolute;
    background: #000;
    inset: 5px;
    border-radius: 20px;
  }
}
</style>
