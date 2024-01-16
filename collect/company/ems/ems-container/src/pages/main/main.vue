<template src="./main.html"></template>
<script lang="ts" src="./main"></script>
<style lang="less" src="./main.less"></style>
<style lang="less">
.el-popper.header-popper {
  z-index: 2050 !important;
  background-color: var(--iot-bg-color-header-menu);
  border-radius: 4px;
  padding: 4px 0;
  border-color: var(--iot-bg-color-header-menu);

  .area-popper {
    max-height: 500px;
    overflow-y: auto;

    &--header {
      display: flex;
      height: 40px;
      align-items: center;
      padding-left: 16px;

      h6 {
        color: #fff;
        font-size: 14px;
        margin-bottom: 0px;
      }

      span {
        height: 100%;
        font-size: 12px;
        color: white;
        opacity: 0.65;
        padding-top: 12px;
        margin-left: 32px;
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
        padding-left: 16px;
        display: flex;
        align-items: center;

        &:hover {
          background-color: rgba(14, 16, 17, 1);
        }

        .el-checkbox__label {
          width: 148px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .el-checkbox {
        .el-checkbox__label span {
          color: #fff;
          opacity: 0.85;
        }
      }
    }
  }

  .alarm-popper {
    margin-bottom: 0;

    li {
      position: relative;
      list-style: none;

      height: 40px;
      box-sizing: border-box;

      padding: 9px 16px 9px 28px;

      display: flex;
      flex-direction: row;
      justify-content: space-between;

      span {
        font-size: 14px;
        line-height: 22px;
        display: inline-block;

        color: rgba(255, 255, 255, 0.85);
      }

      span.count {
        font-size: 12px;
      }

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;

        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
      }

      &:hover {
        cursor: pointer;
        background-color: #0e1011;
        transition: all 233ms;
      }
    }

    li.serious::before {
      background-color: rgba(245, 34, 45, 1);
    }

    li.important::before {
      background-color: rgba(250, 140, 22, 1);
    }

    li.normal::before {
      background-color: rgba(250, 173, 20, 1);
    }

    li.hint::before {
      background-color: rgba(24, 144, 255, 1);
    }
  }
}

.el-popper.user-popper {
  z-index: 2050 !important;
  background-color: var(--iot-bg-color-header-menu);
  border-radius: 4px;
  border-color: var(--iot-bg-color-header-menu);
  padding: 4px 0;
  min-width: 136px !important;

  .logout {
    height: 40px;
    line-height: 40px;
    color: #fff;
    opacity: 0.85;
    padding-left: 16px;
    cursor: pointer;

    .iconfont {
      font-size: 14px;
      margin-right: 8px;
    }

    &:hover {
      background-color: rgba(14, 16, 17, 1);
    }
  }
}

.el-overlay.is-message-box {
  z-index: 999999999 !important;
}
.el-message {
  z-index: 9999999 !important;
}
</style>
