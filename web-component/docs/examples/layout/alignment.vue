<template>
  <te-row class="row-bg">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row class="row-bg" justify="center">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row class="row-bg" justify="end">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row class="row-bg" justify="space-between">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row class="row-bg" justify="space-around">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
  </te-row>
  <te-row class="row-bg" justify="space-evenly">
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple-light" /></te-col>
    <te-col :span="6"><div class="grid-content ep-bg-purple" /></te-col>
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
