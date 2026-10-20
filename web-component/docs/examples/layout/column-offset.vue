<template>
  <te-row :gutter="20">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6" :offset="6"
      ><div class="grid-content ep-bg-purple"
    /></te-col>
  </te-row>
  <te-row :gutter="20">
    <te-col :span="6" :offset="6"
      ><div class="grid-content ep-bg-purple"
    /></te-col>
    <te-col :span="6" :offset="6"
      ><div class="grid-content ep-bg-purple"
    /></te-col>
  </te-row>
  <te-row :gutter="20">
    <te-col :span="12" :offset="6"
      ><div class="grid-content ep-bg-purple"
    /></te-col>
  </te-row>
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
