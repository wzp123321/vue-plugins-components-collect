<template src="./rm-upload-dialog.html"> </template>
<script lang="ts" src="./rm-upload-dialog"></script>
<style lang="less" scoped src="./rm-upload-dialog.less"></style>
<style>
.el-popper.is-dark {
  max-width: 374px !important;
  min-height: 33px !important;
}
.el-popper.is-dark::before {
  border-bottom: 4px solid var(--color-text-primary);
  border-top: 8px solid transparent;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}
</style>
<style>
*:disabled,
*[disabled]:not([disabled='false']) {
  color: #fff !important;
  background-color: rgb(191, 191, 191);
  border-color: rgb(191, 191, 191);
}
</style>
