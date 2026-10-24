<template>
  <div>
    <div style="margin-bottom: 15px">
      direction:
      <te-radio v-model="direction" label="horizontal">horizontal</el-radio>
      <te-radio v-model="direction" label="vertical">vertical</el-radio>
    </div>
    <div style="margin-bottom: 15px">
      fillRatio:<te-slider v-model="fillRatio" />
    </div>
    <te-space
      fill
      wrap
      :fill-ratio="fillRatio"
      :direction="direction"
      style="width: 100%"
    >
      <te-card v-for="i in 5" :key="i" class="box-card">
        <template #header>
          <div class="card-header">
            <span>Card name</span>
            <te-button class="button" text>Operation button</el-button>
          </div>
        </template>
        <div v-for="o in 4" :key="o" class="text item">
          {{ 'List item ' + o }}
        </div>
      </te-card>
    </te-space>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const direction = ref('horizontal')
const fillRatio = ref(30)
</script>
