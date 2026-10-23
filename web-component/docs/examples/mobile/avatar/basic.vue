<template>
  <view class="container">
    <tem-avatar size="large" src="../../../static/logo.png"></tem-avatar>
    <tem-avatar size="medium" src="../../../static/logo.png"></tem-avatar>
    <tem-avatar size="small" src="../../../static/logo.png"></tem-avatar>
    <tem-avatar size="large" text="秦"></tem-avatar>
    <tem-avatar size="medium" text="A"></tem-avatar>
    <tem-avatar size="small" text="仲文"></tem-avatar>
    <tem-avatar size="medium" text="仲文" shape="circle"></tem-avatar>
    <tem-avatar size="medium" text="仲文" shape="square"></tem-avatar>
    <tem-badge text="999" type="danger" size="medium">
      <tem-avatar size="medium" text="仲文" shape="circle"></tem-avatar>
    </tem-badge>
  </view>
</template>

<script lang="ts" setup>
// import { TemAvatar, TemBadge } from '@zpackage/mobile-package';
</script>

<style lang="scss" scoped>
.container {
  display: grid;
  width: max-content;
  padding: 50px;
  gap: 10px;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(2, auto);
}
</style>
