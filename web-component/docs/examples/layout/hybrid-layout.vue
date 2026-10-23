<template>
  <te-row :gutter="20">
    <te-col :span="16"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="8"><div class="grid-content ep-bg-purple" /></el-col>
  </el-row>
  <te-row :gutter="20">
    <te-col :span="8"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="8"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></el-col>
  </el-row>
  <te-row :gutter="20">
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="16"><div class="grid-content ep-bg-purple" /></el-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></el-col>
  </el-row>
</template>

<style>
.te-row {
  margin-bottom: 20px;
}
.te-row:last-child {
  margin-bottom: 0;
}
.te-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
