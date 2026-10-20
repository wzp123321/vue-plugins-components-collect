<template>
  <div class="workflow-log-handler">
    <!-- 多个处理人时 -->
    <template v-if="handlers?.length > 1">
      <workflow-log-handler-popover :axios="axios" :tenantId="tenantId" :handlers="handlers">
        <div class="wlh-operator-avatars-container">
          <div
            v-for="handler in handlers.slice(0, 5)"
            :key="handler.id"
            class="wlh-operator-avatar wlh-operator-avatar-multiple"
          >
            {{ handler.name?.slice(-2) }}
          </div>
          <div v-if="handlers.length > 5" class="wlh-operator-avatar wlh-operator-avatar-multiple-more">
            +{{ handlers.length - 5 }}
          </div>
        </div>
      </workflow-log-handler-popover>
      <div class="wlh-desc">
        {{ approveType === MultiPersonApproveTypeEnum.COUNTERSIGN ? '需所有人处理' : '一人处理即可' }}
      </div>
    </template>
    <!-- 单个处理人时 -->
    <template v-else-if="!!handler">
      <div class="wlh-operator">
        <te-employee-info
          :disabled="notShowPopover"
          :id="handler.id"
          :handler-name="handler.name"
          :axios="axios"
          :tenant-id="tenantId"
        >
          <div class="wlh-operator-avatar" :class="{ 'wlh-operator-not-click': notShowPopover }">
            {{ handler.name?.slice(-2) }}
          </div>
        </te-employee-info>
        <div>
          <div class="wlh-operator-name">{{ handler.name }}</div>
          <!-- 抄送 -->
          <div v-if="ccs?.length" class="wlh-operator-desc">
            <span>{{ `${actionName} ` }} </span>
            <workflow-log-handler-popover :handlers="ccs" :axios="axios" :tenant-id="tenantId">
              <span v-if="ccs.length <= 2" class="wlh-text-primary">{{ ccs.map((item) => item.name).join('、') }}</span>
              <span v-else class="wlh-text-primary">
                {{
                  `${ccs
                    .slice(0, 2)
                    .map((item) => item.name)
                    .join('、')}等${ccs.length}人`
                }}
              </span>
            </workflow-log-handler-popover>
          </div>
          <!-- 转交 -->
          <div v-if="handOverTo" class="wlh-operator-desc">
            <span>{{ `${actionName} ` }} </span>
            <te-employee-info :id="handOverTo.id" :axios="axios" :tenant-id="tenantId">
              <span class="wlh-text-primary">{{ handOverTo.name }}</span>
            </te-employee-info>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { type AxiosInstance } from 'axios';

import { TeEmployeeInfo } from '../../../te-employee-info';
import WorkflowLogHandlerPopover from './workflow-log-handler-popover.vue';
import { MultiPersonApproveTypeEnum } from '../../../models/MultiPersonApproveTypeEnum';
import IdName from '../../../models/IdName';
import { ProcessNodeTypeEnum } from '../../../models/ProcessNodeTypeEnum';

const props = defineProps<{
  handlers: IdName[];
  ccs?: IdName[];
  handOverTo?: IdName;
  approveType: MultiPersonApproveTypeEnum;
  nodeType: ProcessNodeTypeEnum;
  actionName: string;
  axios: AxiosInstance;
  tenantId: string;
}>();

// 单个处理人时
const handler = computed(() => (props.handlers?.length === 1 ? props.handlers[0] : null));
// 结束节点写死为系统 handlerId为system 不弹出人员信息
const notShowPopover = computed(
  () => props.nodeType === ProcessNodeTypeEnum.END_EVENT || handler.value?.id === 'system' || !handler.value?.id
);
</script>

<style lang="less">
.workflow-log-handler {
  .wlh-operator {
    display: flex;
    align-items: center;
  }
  .wlh-operator-avatars-container {
    display: flex;
    width: fit-content;
  }
  .wlh-operator-avatar {
    display: inline-block;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-right: var(--te-space-4);
    font-size: var(--te-font-size-b12);
    background: var(--te-color-primary);
    border-radius: 50%;
    color: var(--te-color-white);
    text-align: center;
    line-height: 32px;
    cursor: pointer;
    &:last-child {
      margin-right: 0;
    }
  }
  .wlh-operator-not-click {
    cursor: auto;
  }
  .wlh-operator-avatar-multiple {
    margin-right: 0;
    &:not(:first-child) {
      margin-left: -8px;
      border: 1px solid var(--te-bg-color-page);
    }
  }
  .wlh-operator-avatar-multiple-more {
    margin: 0 0 0 -8px;
    color: var(--te-color-primary);
    border: 1px solid var(--Bg---te-bg-color-page);
    background: var(--te-color-primary-light-9);
  }
  .wlh-operator-name {
    vertical-align: middle;
  }
  .wlh-operator-desc {
    font-size: 12px;
    line-height: 20px;
    color: var(--te-text-color-secondary);
  }
  .wlh-text-primary {
    color: var(--te-color-primary);
    cursor: pointer;
  }
  .wlh-desc {
    margin-top: var(--te-space-4);
    font-size: var(--te-font-size-b12);
    line-height: 20px;
    color: var(--te-text-color-secondary);
  }
}

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
</style>
