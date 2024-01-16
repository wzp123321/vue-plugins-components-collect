<template src="./cd-table.html"></template>
<script lang="ts" src="./cd-table"></script>
<style lang="less" scoped src="./cd-table.less"></style>
<style lang="less">
.el-message-box.cost-delete-confirm {
  padding-bottom: 16px;

  .el-message-box__header {
    padding: 12px 22px 12px 20px;
    background-color: rgba(237, 245, 252, 1);

    .el-message-box__title span {
      color: var(--color-primary);
      font-size: 16px;
    }

    .el-message-box__headerbtn {
      height: 22px;
      line-height: 22px;

      i {
        top: auto;
        position: relative;
        bottom: 2px;
        font-size: 20px;
        color: var(--color-text-secondary);
      }
    }
  }

  .el-message-box__content {
    padding: 31px 19px 31px 0;

    .el-message-box__message {
      padding-left: 23px;
    }

    p {
      color: var(--color-text-primary);
    }
  }

  .el-message-box__btns {
    padding: 10px 20px 0 0;

    button.el-button.el-button--default {
      border-color: var(--color-text-border) !important;
    }
  }
}

.costnode-select.el-select__popper.el-popper[aria-hidden='false'] {
  .el-select-dropdown__wrap.el-scrollbar__wrap.el-scrollbar__wrap--hidden-default
    .el-scrollbar__view.el-select-dropdown__list
    .el-select-dropdown__item.selected:not(.option) {
    display: none !important;
  }
}

.cost-select-popper.el-select__popper.el-popper[aria-hidden='false'] {
  z-index: 4 !important;

  .el-select-dropdown__item.option {
    padding: 0 12px;
    overflow: initial;
  }
}
</style>
