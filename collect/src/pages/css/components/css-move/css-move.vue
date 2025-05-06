<template>
  <div class="css-move">
    <div class="cm-box">
      <div class="cm-box-label"></div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.css-move {
  width: 100%;
  height: 100%;

  background-color: rgba(0, 12, 23, 0.867);
  border-radius: 4px;
  display: flex;
  overflow: hidden;

  .cm-box {
    align-items: center;
    background-image: linear-gradient(90deg, #04182c, #000c17, #04182c);
    display: flex;
    height: 360px;
    justify-content: center;
    width: 100%;

    .cm-box-label {
      background-image: linear-gradient(45deg, #000, #000 50%, #fff 0);
      height: 160px;
      position: relative;
      width: 600px;

      &::after {
        -webkit-animation: MixBlendMode_move__YyI7R 5s linear infinite;
        animation: MixBlendMode_move__YyI7R 5s linear infinite;
        color: #fff;
        content: 'Hello World';
        font-size: 56px;
        left: 50%;
        mix-blend-mode: difference;
        position: absolute;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        white-space: nowrap;
      }

      @keyframes MixBlendMode_move__YyI7R {
        0% {
          transform: translateX(-50%);
        }

        25% {
          transform: translateX(-14%);
        }

        50% {
          transform: translateX(-50%);
        }

        75% {
          transform: translateX(-86%);
        }

        100% {
          transform: translateX(-50%);
        }
      }
    }
  }
}
</style>
