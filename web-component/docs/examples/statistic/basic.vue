<template>
  <te-row>
    <te-col :span="6">
      <te-statistic title="Daily active users" :value="268500" />
    </te-col>
    <te-col :span="6">
      <te-statistic :value="138">
        <template #title>
          <div style="display: inline-flex; align-items: center">
            Ratio of men to women
            <te-icon style="margin-left: 4px" :size="12">
              <Male />
            </te-icon>
          </div>
        </template>
        <template #suffix>/100</template>
      </te-statistic>
    </te-col>
    <te-col :span="6">
      <te-statistic title="Total Transactions" :value="172000" />
    </te-col>
    <te-col :span="6">
      <te-statistic title="Feedback number" :value="562">
        <template #suffix>
          <te-icon style="vertical-align: -0.125em">
            <ChatLineRound />
          </te-icon>
        </template>
      </te-statistic>
    </te-col>
  </te-row>
</template>

<script lang="ts" setup>
import { ChatLineRound, Male } from '@element-plus/icons-vue'
</script>

<style scoped>
.te-col {
  text-align: center;
}
</style>
