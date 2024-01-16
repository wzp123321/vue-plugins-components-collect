<template src="./ec-choose-year.html"> </template>
<script lang="ts" src="./ec-choose-year"></script>
<style lang="less" scoped src="./ec-choose-year.less"></style>
<style lang="less">
.el-popper.month-popper {
  padding: 0;

  .yearHead {
    text-align: center;
    padding: 9px 16px 8px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    border-bottom: 1px solid var(--color-text-divider);

    .yearClass {
      height: 22px;
      line-height: 22px;
      font-size: 14px;
      color: var(--color-text-title);

      i {
        color: var(--color-text);
      }
    }

    .up,
    .down {
      height: 14px;
      line-height: 14px;
    }

    .up i.iconfont,
    .down i.iconfont {
      font-size: 14px;
      color: #000;
      font-weight: normal;
    }
  }
}

.monthBox {
  display: grid;
  grid-template-columns: repeat(3, calc(33.33%));
  grid-row-gap: 0;
  grid-column-gap: 0;
  padding: 0 16px 16px 16px;

  .monthItem {
    text-align: center;
    padding: 16px 0;
    cursor: pointer;

    > span {
      display: inline-block;
      width: 48px;
      text-align: center;
      height: 24px;
      line-height: 24px;
      margin: 0 auto;
      border-radius: 2px;
    }

    &:not(.date-disabled):not(.activeMonth):hover > span {
      background-color: rgba(0, 0, 0, 0.04);
    }

    &.activeMonth > span {
      background-color: var(--color-primary);
      color: var(--color-default);
    }

    &.date-disabled > span {
      background-color: rgba(0, 0, 0, 0.04);
      color: var(--color-text-disable);
      cursor: not-allowed;
    }
  }
}
</style>
