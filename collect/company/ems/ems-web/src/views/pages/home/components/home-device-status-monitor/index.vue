<template>
  <div class="device-status-monitor">
    <!-- 每个设备 -->
    <div class="device-status-monitor-item"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'DeviceStatusMonitor',
  props: {
    uid: {
      type: Number,
      default: null,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="less" scoped>
.device-status-monitor {
  color: var(--iot-font-color-shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 30px;
  &-item {
    &:nth-child(2n + 1) {
      margin-right: 10px;
    }

    &:first-child {
      margin-bottom: 10px;
    }

    &:nth-child(0n + 2) {
      margin-bottom: 10px;
    }
  }
}
</style>
