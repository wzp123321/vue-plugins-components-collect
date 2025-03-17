<template>
  <div class="animation-rolling-over">
    <div class="photo">
      <img src="https://picsum.photos/200/100?random=1" alt="Front" />
      <img src="https://picsum.photos/200/100?random=2" alt="Back" class="back" />
    </div>
    <div class="photo">
      <img src="https://picsum.photos/200/100?random=3" alt="Front" />
      <img src="https://picsum.photos/200/100?random=4" alt="Back" class="back" />
    </div>
    <div class="photo">
      <img src="https://picsum.photos/200/100?random=5" alt="Front" />
      <img src="https://picsum.photos/200/100?random=6" alt="Back" class="back" />
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'AnimationRollingOver',
});
</script>
<style lang="less" scoped>
.animation-rolling-over {
  width: 100%;
  display: flex;
  align-items: center;

  .photo {
    width: 200px;
    height: 300px;
    margin: 0 10px;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    position: relative;
  }

  .photo:hover {
    transform: rotateY(180deg);
  }

  .photo img {
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    border-radius: 10px;
  }

  .photo img.back {
    transform: rotateY(180deg);
  }
}
</style>
