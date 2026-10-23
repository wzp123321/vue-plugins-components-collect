<template>
  <te-popover
    placement="top-start"
    :width="168"
    trigger="click"
    popper-class="workflow-log-handler"
    :popper-style="{ padding: 0 }"
  >
    <template #reference>
      <slot />
    </template>
    <div class="wlh-popover-container">
      <te-employee-info
        v-for="handler in handlers"
        :key="handler.id"
        :id="handler.id"
        :axios="axios"
        :tenant-id="tenantId"
      >
        <div class="wlh-popover-item">
          <div class="wlh-operator-avatar">{{ handler.name?.slice(-2) }}</div>
          <div class="wlh-operator-name">{{ handler.name }}</div>
        </div>
      </te-employee-info>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ElPopover } from 'element-plus';
import { type AxiosInstance } from 'axios';
import IdName from '../../../models/IdName';
import { TeEmployeeInfo } from '../../../te-employee-info';

defineProps<{
  handlers: IdName[];
  axios: AxiosInstance;
  tenantId: string;
}>();
</script>

<style scoped lang="less">
.workflow-log-handler {
  .wlh-popover-container {
    max-height: 248px;
    padding: var(--te-space-16) var(--te-space-16) var(--te-space-12);
    overflow: auto;
  }

  .wlh-popover-item {
    display: flex;
    align-items: center;
    width: fit-content;
    padding: var(--te-space-4);
    margin-bottom: var(--te-space-4);
  }
}
</style>
