<template>
  <view class="cell-container">
    <tem-cell-select titleText="标题" require @click="onClick">
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell-select>
    <tem-cell-select
      titleText="标题文字"
      :select-text="selectValue"
      layout="vertical"
      tips="真的很抱歉"
    >
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell-select>
    <tem-cell-select
      titleText="标题文字"
      tips="很抱歉"
      layout="vertical"
      disabled
    >
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell-select>
  </view>
</template>

<script>
// import { TemCellSelect, TemAvatar } from '@tiansu/ts-mobile-package';
// import {
//   IconWarning,
//   IconCircleCheck,
//   IconCircleClose,
//   IconLoadingWhite,
// } from '@arco-iconbox/vue-tem';
export default {
  components: {
    // IconWarning,
    // IconCircleCheck,
    // IconCircleClose,
    // IconLoadingWhite,
  },
  data() {
    return {
      selectValue: 'A',
    };
  },
  mounted() {
    setTimeout(() => {
      this.selectValue = 'B';
    }, 4000);
  },
  methods: {
    onClick(type) {
      console.log('clickType', type);
    },
  },
};
</script>

<style lang="scss">
.cell-container {
  .temicon--icon {
    width: 48rpx;
    height: 48rpx;
    color: var(--tem-color-primary);
  }
}
</style>
