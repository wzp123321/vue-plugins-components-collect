<template src="./ec-choose-month.html"> </template>
<script lang="ts" src="./ec-choose-month"></script>
<style lang="less" scoped src="./ec-choose-month.less"></style>
<style lang="less" scoped>
.el-popper.month-popper {
  padding: 0;

  .yearHead {
    text-align: center;
    padding: 9px 16px 8px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    border-bottom: 1px solid var(--color-text-divider);
    margin-bottom: 16px;

    .yearClass {
      color: var(--color-text-title);

      i {
        color: var(--color-text);
      }
    }

    .yearLeft,
    .right {
      height: 14px;
      line-height: 14px;
    }

    .yearLeft i.iconfont,
    .right i.iconfont {
      font-weight: normal;
      font-size: 14px;
      color: #000;
    }
  }

  .yearBox {
    display: grid;
    grid-template-columns: repeat(3, calc(33.33%));
    grid-row-gap: 0;
    grid-column-gap: 0;
    padding: 0 16px 16px 16px;

    .monthItem {
      text-align: center;
      cursor: pointer;
      padding: 16px 0;

      > span {
        display: inline-block;
        width: 48px;
        text-align: center;
        height: 24px;
        line-height: 24px;
        margin: 0 auto;
        border-radius: 2px;
      }

      &:not(.activeMonth):hover > span {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.activeMonth > span {
        background-color: var(--color-primary);
        color: var(--color-default);
      }
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
    cursor: pointer;
    padding: 16px 0;

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
