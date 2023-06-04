<!--
 * @Author: wanzp
 * @Date: 2023-06-04 19:45:59
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-04 19:57:54
 * @Description: 
-->
<template>
  <div class="css-image-scale">
    <div class="cis-box">
      <div class="cis-box-container">
        <img src="http://hepengwei.cn/images/7380e6f7.jpg" alt="" />
        <img src="http://hepengwei.cn/images/ba36f098.jpg" alt="" />
        <img src="http://hepengwei.cn/images/e7c8df7d.jpg" alt="" />
        <img src="http://hepengwei.cn/images/06a46209.jpg" alt="" />
        <img src="http://hepengwei.cn/images/ed6d9a11.jpg" alt="" />
        <img src="http://hepengwei.cn/images/271a66ed.jpg" alt="" />
        <img src="http://hepengwei.cn/images/2506df73.jpg" alt="" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.css-image-scale {
  width: 100%;
  height: 100%;

  border-radius: 10px;
  display: flex;
  margin: 4px 2px;
  overflow: hidden;

  .cis-box {
    align-items: center;
    background-image: linear-gradient(90deg, #04182c, #000c17, #04182c);
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    width: 100%;

    .cis-box-container {
      --s: 90px;
      --g: 10px;
      display: grid;
      margin: calc(var(--s) + var(--g));
    }
  }

  img {
    aspect-ratio: 0.866;
    -webkit-clip-path: polygon(0 25%, 0 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0);
    clip-path: polygon(0 25%, 0 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0);
    cursor: pointer;
    -webkit-filter: grayscale(80%);
    filter: grayscale(80%);
    grid-area: 1/1;
    object-fit: cover;
    -webkit-transform: translate(0) scale(1);
    transform: translate(0) scale(1);
    -webkit-transform: translate(var(--x, 0), var(--y, 0)) scale(var(--t, 1));
    transform: translate(var(--x, 0), var(--y, 0)) scale(var(--t, 1));
    transition: 0.2s linear;
    width: var(--s);
  }

  img:first-child {
    --x: calc(-100% - var(--g));
  }
  img:nth-child(3),
  img:nth-child(4) {
    --x: calc(-50% - var(--g) * 0.5);
  }

  img:nth-child(3),
  img:nth-child(5) {
    --y: calc(-75% - var(--g) * 0.87);
  }

  img:nth-child(4),
  img:nth-child(6) {
    --y: calc(75% + var(--g) * 0.87);
  }

  img:nth-child(5),
  img:nth-child(6) {
    --x: calc(50% + var(--g) * 0.5);
  }

  img:nth-child(7) {
    --x: calc(100% + var(--g));
  }

  img:hover {
    --t: 1.2;
    -webkit-filter: grayscale(0);
    filter: grayscale(0);
    z-index: 1;
  }
}
</style>
