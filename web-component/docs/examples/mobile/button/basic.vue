<template>
  <view class="row">
    <tem-button>Default</tem-button>
    <tem-button type="primary">Primary</tem-button>
    <tem-button type="light">Light</tem-button>
    <tem-button type="danger">Danger</tem-button>
  </view>
  <view class="row">
    <tem-button plain>Plain</tem-button>
    <tem-button type="primary" plain>Primary</tem-button>
    <tem-button type="light" plain>Light</tem-button>
    <tem-button type="danger" plain>Danger</tem-button>
  </view>
  <view class="row">
    <tem-button round>Round</tem-button>
    <tem-button type="primary" round>Primary</tem-button>
    <tem-button type="light" round>Light</tem-button>
    <tem-button type="danger" round>Danger</tem-button>
  </view>
  <view class="row">
    <tem-button icon circle><icon-plus /></tem-button>
    <tem-button type="primary" icon circle><icon-plus /></tem-button>
    <tem-button type="light" icon circle><icon-plus /></tem-button>
    <tem-button type="danger" icon circle><icon-plus /></tem-button>
  </view>
</template>

<script setup lang="ts">
// import { TemButton } from '@tiansu/ts-mobile-package';
// import { IconPlus } from '@arco-iconbox/vue-tem';
</script>

<style lang="scss">
.row {
  display: flex;
  gap: var(--tem-spacing-l);
  flex-wrap: wrap;
  margin-bottom: var(--tem-spacing-5xl);
}
</style>
