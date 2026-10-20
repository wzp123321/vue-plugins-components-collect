<template>
  <div class="demo-progress">
    <te-progress :percentage="50" :stroke-width="15" striped />
    <te-progress
      :percentage="30"
      :stroke-width="15"
      status="warning"
      striped
      striped-flow
    />
    <te-progress
      :percentage="100"
      :stroke-width="15"
      status="success"
      striped
      striped-flow
      :duration="10"
    />
    <te-progress
      :percentage="percentage"
      :stroke-width="15"
      status="exception"
      striped
      striped-flow
      :duration="duration"
    />
    <te-button-group>
      <te-button :icon="Minus" @click="decrease" />
      <te-button :icon="Plus" @click="increase" />
    </te-button-group>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'

const percentage = ref<number>(70)
const duration = computed(() => Math.floor(percentage.value / 10))

const increase = () => {
  percentage.value += 10
  if (percentage.value > 100) {
    percentage.value = 100
  }
}
const decrease = () => {
  percentage.value -= 10
  if (percentage.value < 0) {
    percentage.value = 0
  }
}
</script>

<style scoped>
.demo-progress .te-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>
