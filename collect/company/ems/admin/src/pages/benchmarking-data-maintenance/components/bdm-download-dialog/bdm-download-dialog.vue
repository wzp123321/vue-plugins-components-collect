<template src="./bdm-download-dialog.html"></template>
<script lang="ts" src="./bdm-download-dialog"></script>
<style lang="less" scoped src="./bdm-download-dialog.less"></style>
<style>
.el-year-table td.today .cell {
  font-weight: 400;
  color: #c0c4cc;
}
.el-month-table td.today .cell {
  font-weight: 400;
  color: #c0c4cc;
}
.el-month-table td.disabled .cell {
  color: #c0c4cc !important;
}
.el-month-table td.current:not(.disabled) .cell{
  color: #fff;
  background-color: var(--iot-color-active);
}
.el-month-table td.current:not(.disabled):hover{
  background-color: #fff !important;
}
.el-picker-panel table > tbody > tr:nth-child(even) > td {
  background-color: #fff;
}
.el-year-table td.current:not(.disabled) .cell{
  color: #fff;
  background-color: var(--iot-color-active);
}
.el-year-table td.current:not(.disabled) .cell:hover {
  color: #fff !important;
  background-color: var(--iot-color-active) !important;
}
.el-picker-panel table > tbody > tr:nth-child(odd) > td{
   background-color: #fff;
}
</style>