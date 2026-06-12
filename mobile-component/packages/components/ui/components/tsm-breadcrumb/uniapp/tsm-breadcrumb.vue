<template>
  <view class="tsm-bread-crumb">
    <!-- 插槽：default - 面包屑项列表（tsm-breadcrumb-item 组件） -->
    <slot />
  </view>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-bread-crumb {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: var(--tsm-spacing-xs);
}

:deep(.tsm-bread-crumb-item:last-child .tsm-bread-crumb-separator) {
  display: none;
}

:deep(.tsm-bread-crumb-item:last-child .tsm-bread-crumb-label-text) {
  color: var(--tsm-color-text-primary);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
}

:deep(.tsm-bread-crumb-item:last-child .tsm-bread-crumb-item-inner-icon) {
  --tsm-breadcrumb-item-icon-color: var(--tsm-color-text-primary);
}
</style>
