<template src="./environment-evaluation.html"></template>
<script lang="ts" src="./environment-evaluation"></script>
<style lang="less" scoped src="./environment-evaluation.less"></style>
<style lang="less">
.light-mode .change-adress {
  font-size: 14px;
  left: -13px !important;
}
.light-mode .keep-adress {
  left: 63px !important;
}

.keep-adress.el-popper.is-dark::before {
  content: '';
  border-bottom: 3px solid var(--color-text-primary);
  border-top: 3px solid transparent;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  position: absolute;
  top: -6px;
  left: 12%;
  transform: translateX(-50%);
}
// :deep(.el-popper.is-dark) {
//   max-width: 500px;
//   padding: 8px 8px;
// }
.change-adress.el-popper.is-dark {
  min-width: 30px;
  max-width: 340px;
  min-height: 32px;
  line-height: 21px;
  padding: 6px 14px;
  color: var(--color-default);
  text-align: left;
  text-decoration: none;
  word-wrap: break-all;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--color-text-border);
}
.change-adress.el-popper.is-dark::before {
  content: '';
  border-bottom: 3px solid var(--color-text-primary);
  border-top: 3px solid transparent;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  position: absolute;
  top: -6px;
  left: 7%;
  transform: translateX(-50%);
}
  .el-popper {
    .el-popper__arrow {
      display: none;
    }
  }
</style>