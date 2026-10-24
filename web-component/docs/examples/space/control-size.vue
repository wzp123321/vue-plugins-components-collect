<template>
  <te-space direction="vertical" alignment="start" :size="30">
    <te-radio-group v-model="size">
      <te-radio :label="'large'">large</el-radio>
      <te-radio :label="'default'">default</el-radio>
      <te-radio :label="'small'">small</el-radio>
    </el-radio-group>

    <te-space wrap :size="size">
      <te-card v-for="i in 3" :key="i" class="box-card" style="width: 250px">
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
  </te-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const size = ref('default')
</script>
