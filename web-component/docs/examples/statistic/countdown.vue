<template>
  <te-row>
    <te-col :span="8">
      <te-countdown title="Start to grab" :value="value" />
    </te-col>
    <te-col :span="8">
      <te-countdown
        title="Remaining VIP time"
        format="HH:mm:ss"
        :value="value1"
      />
      <te-button class="countdown-footer" type="primary" @click="reset"
        >Reset
      </te-button>
    </te-col>
    <te-col :span="8">
      <te-countdown format="DD [days] HH:mm:ss" :value="value2">
        <template #title>
          <div style="display: inline-flex; align-items: center">
            <te-icon style="margin-right: 4px" :size="12">
              <Calendar />
            </te-icon>
            Still to go until next month
          </div>
        </template>
      </te-countdown>
      <div class="countdown-footer">{{ value2.format('YYYY-MM-DD') }}</div>
    </te-col>
  </te-row>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { Calendar } from '@element-plus/icons-vue'

const value = ref(Date.now() + 1000 * 60 * 60 * 7)
const value1 = ref(Date.now() + 1000 * 60 * 60 * 24 * 2)
const value2 = ref(dayjs().add(1, 'month').startOf('month'))

function reset() {
  value1.value = Date.now() + 1000 * 60 * 60 * 24 * 2
}
</script>

<style scoped>
.te-col {
  text-align: center;
}

.countdown-footer {
  margin-top: 8px;
}
</style>
