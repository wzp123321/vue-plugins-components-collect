<template>
  <div class="car-searchbar" id="car-searchbar">
    <el-form :inline="true" :model="searchBar.queryParams" @submit.native.prevent>
      <el-form-item label="时间维度">
        <el-select v-model="searchBar.queryParams.queryType" placeholder="请选择" @change="handleTypeChange">
          <el-option v-for="(item, index) in searchBar.queryTypeOptions" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="searchBar.queryParams.date"
          :disabled-date="mapDisabledDate"
          :clearable="false"
          :editable="false"
          type="year"
          placeholder="请选择"
        />
      </el-form-item>
      <el-form-item>
        <button primary @click="searchBar.search">查询</button>
        <button @click="searchBar.reset">重置</button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import searchBar from './car-searchbar.service';

function handleTypeChange(value: number) {
  searchBar.handleDateReset();
}

function mapDisabledDate(current: Date): boolean {
  // if (!!searchBar.dateScope.startTime && !!searchBar.dateScope.endTime && !!searchBar.dateScope.time) {
  //   // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
  //   return (
  //     current > new Date(searchBar.dateScope.time) ||
  //     current < new Date(searchBar.dateScope.startTime) ||
  //     current > new Date(searchBar.dateScope.endTime)
  //   );
  // }
  return current.getTime() > new Date().getTime();
}
</script>
<style lang="less" scoped></style>
