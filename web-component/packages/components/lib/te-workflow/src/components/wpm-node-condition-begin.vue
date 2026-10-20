<template></template>
<script setup lang="ts"></script>
<style scoped lang="less">
.wpm-node-condition-begin {
  position: relative;
  height: 64px;
  width: 160px;
  .wpmncb-bg {
    height: 100%;
    width: 100%;
  }
  .wpmncb-wrap {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .wpmncb-wrap-tag {
      width: 36px;
      height: 20px;
      border-radius: 20px;
      background: var(--te-color-success-light-9);
      color: var(--te-color-success);
      font-size: var(--te-font-size-b14);
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
