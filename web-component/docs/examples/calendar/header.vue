<template>
  <te-calendar ref="calendar">
    <template #header="{ date }">
      <span>Custom header content</span>
      <span>{{ date }}</span>
      <te-button-group>
        <te-button size="small" @click="selectDate('prev-year')">
          Previous Year
        </el-button>
        <te-button size="small" @click="selectDate('prev-month')">
          Previous Month
        </el-button>
        <te-button size="small" @click="selectDate('today')">Today</el-button>
        <te-button size="small" @click="selectDate('next-month')">
          Next Month
        </el-button>
        <te-button size="small" @click="selectDate('next-year')">
          Next Year
        </el-button>
      </te-button-group>
    </template>
  </te-calendar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const calendar = ref()
const selectDate = (val: string) => {
  calendar.value.selectDate(val)
}
</script>
