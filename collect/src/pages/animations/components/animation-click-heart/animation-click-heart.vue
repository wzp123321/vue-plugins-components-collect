<template>
  <div class="animation-click-heart">
    <a-button class="like-btn" @click="handleClick">点击小红心</a-button>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'AnimationClickHeart',
});

const handleClick = (e: any) => {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = e?.clientX + 'px';
  heart.style.top = e?.clientY + 'px';

  const container = document.querySelector('.animation-click-heart');
  container?.appendChild(heart);
  console.log(container, heart);
  setTimeout(() => {
    // heart.remove();
  }, 1000);
};
</script>
<style lang="less" scoped>
.animation-click-heart {
  width: 100%;

  .heart {
    position: absolute;
    width: 30px;
    height: 30px;
    background-image: url('../../../../assets/images/css/css-heart.svg');
    background-size: contain;
    background-repeat: no-repeat;
    animation: flyHeart 1s ease-out;
  }

  @keyframes flyHeart {
    0% {
      transform: scale(0) translateY(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.5) translateY(-10px);
      opacity: 1;
    }
    100% {
      transform: scale(1) translateY(-20px);
      opacity: 0;
    }
  }
}
</style>
