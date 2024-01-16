<!--
 * @Description: 
 * @Autor: zpwan
 * @Date: 2022-04-06 13:50:20
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-06 17:20:43
-->
<template src="./page-aside.html"> </template>
<script lang="ts" src="./page-aside"></script>
<style lang="less" scoped src="./page-aside.less"></style>
<style lang="less">
.ant-menu-submenu.ant-menu-submenu-popup {
  span {
    font-size: 16px !important;
    color: var(--color-aside-fontsize-color);
  }
  i {
    opacity: 1 !important;
  }
  ul {
    border-radius: 4px;
    background-color: var(--color-default) !important;
    li[role='none'] {
      height: 48px;
      line-height: 48px;
      margin: 0;
      padding-left: 24px;
      &:hover {
        background-color: var(--color-aside-background);
      }
      &.ant-menu-submenu-selected {
        .ant-menu-submenu-title {
          .ant-menu-title-content {
            color: var(--color-aside-primary) !important;
          }
        }
        &:hover {
          i::before,
          i::after {
            background-color: var(--color-aside-primary) !important;
          }
        }
      }
      .ant-menu-submenu-title {
        height: 48px;
        line-height: 48px;
        margin: 0;
        padding: 0;
      }
    }
    & > div > li.ant-menu-item.ant-menu-item-only-child {
      margin: 0;
      height: 48px;
      line-height: 48px;
      padding-left: 24px;
      &.ant-menu-item-selected {
        background-color: var(--color-aside-background);
        .ant-menu-title-content {
          color: var(--color-aside-primary);
        }
      }
    }
    li.ant-menu-item.ant-menu-item-only-child:hover {
      background-color: var(--color-aside-background);
    }
  }
}
</style>
