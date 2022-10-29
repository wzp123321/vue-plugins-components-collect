<template src="./container.html"></template>
<script lang="ts" src="./container"></script>
<style lang="less" src="./container.less"></style>
<style lang="less">
.el-popper.header-popper {
  z-index: 2050 !important;
  background-color: var(--color-menu-bg);
  border-radius: 4px;
  padding: 4px 0;
  border-color: var(--color-menu-bg);

  .area-popper {
    max-height: 500px;
    overflow-y: auto;

    &--header {
      display: flex;
      height: 40px;
      align-items: center;

      h6 {
        color: #fff;
        font-size: 14px;
        margin-left: 15px;
      }

      span {
        font-size: 12px;
        color: #fb8113;
        margin-left: 15px;
        text-align: end;
      }
    }

    &--list {
      .el-checkbox {
        width: 100%;
        overflow: hidden;
        display: block;
        height: 40px;
        color: #fff;
        padding-left: 14px;
        display: flex;
        align-items: center;

        &:hover {
          background-color: #0e1011;
        }

        .el-checkbox__input {
          position: relative;
          top: 2px;
        }

        .el-checkbox__label {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .el-checkbox.is-checked {
        .el-checkbox__label span {
          color: #fff;
        }
      }
    }
  }
}

.el-popper.user-popper {
  z-index: 2050 !important;
  background-color: var(--color-menu-bg);
  border-radius: 4px;
  border-color: var(--color-menu-bg);
  padding: 4px 0;

  .logout {
    height: 40px;
    line-height: 40px;
    color: #fff;
    padding-left: 14px;
    cursor: pointer;

    .iconfont {
      font-size: 14px;
    }

    &:hover {
      background-color: #0e1011;
    }
  }
}

.el-overlay.is-message-box {
  z-index: 999999999 !important;
}
</style>
