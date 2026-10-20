<template>
  <te-row>
    <te-col :span="24"><div class="grid-content ep-bg-purple-dark" /></te-col>
  </te-row>
  <te-row>
    <te-col :span="12"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="12"><div class="grid-content ep-bg-purple-light" /></te-col>
  </te-row>
  <te-row>
    <te-col :span="8"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="8"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="8"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
  </te-row>
  <te-row>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="4"><div class="grid-content ep-bg-purple-light" /></te-col>
  </te-row>
</template>

<style lang="scss">
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
