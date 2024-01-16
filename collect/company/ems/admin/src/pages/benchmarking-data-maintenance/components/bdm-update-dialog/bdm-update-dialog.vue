<template src="./bdm-update-dialog.html"></template>
<script lang="ts" src="./bdm-update-dialog"></script>
<style lang="less" scoped src="./bdm-update-dialog.less"></style>
<style>
.el-month-table td.today .cell {
  font-weight: 400;
  color: #c0c4cc;
}
.el-month-table td.disabled .cell {
  color: #c0c4cc !important;
}
.el-month-table td.current:not(.disabled) .cell {
  color: #fff;
  background-color: var(--iot-color-active);
}
.el-month-table td.current:not(.disabled):hover {
  background-color: #fff !important;
}
.el-picker-panel table > tbody > tr:nth-child(even) > td {
  background-color: #fff;
}
.el-picker-panel table > tbody > tr:nth-child(odd) > td {
  background-color: #fff;
}
</style>