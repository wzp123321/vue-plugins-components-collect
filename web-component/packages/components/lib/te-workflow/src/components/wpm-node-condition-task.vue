<template>
  <div class="wpm-node-conditon-task">
    <div class="wpmnct-wrap">
      <div class="wpmnct-wrap-center">
        <div class="wpmnct-wrap-center-title">
          <div class="wpmnct-wrap-name">
            <div class="wpmnct-wrap-name-value" :title="data.text">{{ data.text || '分支' }}</div>
          </div>
          <div class="wpmnct-wrap-type">
            {{
              pre.data.type === ProcessNodeTypeEnum.EXCLUSIVE_GATEWAY
                ? data.branchType === 'timeoutBranch'
                  ? '超时分支'
                  : data.branchType === 'defaultBranch'
                    ? '默认分支'
                    : '条件分支'
                : pre.data.type === ProcessNodeTypeEnum.APPOINT_GATEWAY
                  ? '指定分支'
                  : '并行分支'
            }}
          </div>
        </div>
        <div class="wpmnct-wrap-center-content">
          <te-tooltip
            class="box-item"
            effect="light"
            :show-arrow="false"
            placement="top-start"
            v-if="
              pre.data.type === ProcessNodeTypeEnum.EXCLUSIVE_GATEWAY &&
              data.branchType !== 'timeoutBranch' &&
              data.branchType !== 'defaultBranch' &&
              data.conditionZhStr
            "
          >
            <template #default>
              <span class="wpmnct-wrap-center-label"> {{ data.conditionZhStr }} </span>
            </template>
            <template #content>
              <span class="wpmnct-wrap-center-label"> {{ data.conditionZhStr }} </span>
            </template>
          </te-tooltip>
          <span class="wpmnct-wrap-center-label" v-else>
            {{
              pre.data.type === ProcessNodeTypeEnum.EXCLUSIVE_GATEWAY
                ? data.branchType === 'timeoutBranch'
                  ? '分支前序任务节点超时，将执行此超时默认分支'
                  : data.branchType === 'defaultBranch'
                    ? '未满足其他分支条件，将执行此默认分支'
                    : '满足条件时进入当前分支'
                : pre.data.type === ProcessNodeTypeEnum.APPOINT_GATEWAY
                  ? '执行唯一分支，由上一步执行人指定'
                  : '执行所有分支'
            }}
          </span>
        </div>
      </div>
    </div>
    <div class="wpm-node-conditon-task-line"></div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Graph, Node } from '@antv/x6';
import { ProcessNodeTypeEnum } from '../../../models/ProcessNodeTypeEnum';
import { TeTooltip } from '@tiansu/element-plus';

const getNode: Function | undefined = inject<Function>('getNode');
const getGraph: Function | undefined = inject<Function>('getGraph');
const node = getNode?.() as Node;
const graph = getGraph?.() as Graph;
const data = ref(node.data || {});
node.data.refData = data;
onMounted(() => {});
const pre = ref(graph.getNeighbors(node, { incoming: true })[0]);
console.log(pre);
</script>
<style scoped lang="less">
.wpm-node-conditon-task {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .wpmnct-wrap {
    display: flex;
    flex-direction: row;
    width: 240px;
    height: 86px;
    background-color: var(--te-color-white);
    border-radius: 8px;
    .wpmnct-wrap-left {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 14px;
      border-right: 1px solid var(--te-border-color-extra-light);
      display: none;
    }
    .wpmnct-wrap-right {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 14px;
      border-left: 1px solid var(--te-border-color-extra-light);
      display: none;
    }
    .wpmnct-wrap-center {
      display: flex;
      flex-direction: column;
      margin: 0 8px 0 8px;
      flex: 1 1 0;
      overflow: hidden;
      .wpmnct-wrap-center-title {
        display: flex;
        align-items: center;
        margin: var(--te-space-8) 0;
        height: 24px;
        line-height: 24px;
        color: var(--te-color-success);
        font-size: var(--te-font-size-b12);
      }
      .wpmnct-wrap-name {
        flex: 1 1 0;
        display: flex;
        align-items: center;
        overflow: hidden;
        height: 24px;
        :deep(> .te-input__wrapper) {
          height: 24px;
        }
      }

      .wpmnct-wrap-name-value {
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 100%;
        padding-left: var(--te-space-4);
        padding-right: var(--te-space-4);
      }
      .wnt-wrap-name-edit-icon {
        flex: 0 0 16px;
        display: none;
        height: 100%;
        padding-right: var(--te-space-4);
      }
      :hover.wpmnct-wrap-name {
        .wpmnct-wrap-name-value,
        .wnt-wrap-name-edit-icon {
          background-color: var(--te-fill-color-light);
        }
      }
      .wpmnct-wrap-type {
        flex: 0 0 64px;
        height: 24px;
        color: var(--te-text-color-primary);
        background-color: var(--te-color-info-light-9);
        border-radius: 12px;
        text-align: center;
      }
      .wnt-wrap-delete-icon {
        color: var(--te-text-color-regular);
        flex: 0 0 14px;
        height: 100%;
        display: none;
      }
      :hover.wnt-wrap-delete-icon {
        color: var(--te-color-primary);
      }
      .wpmnct-wrap-center-content {
        display: flex;
        height: 38px;
        line-height: 18px;
        border-top: 1px solid var(--te-border-color-lighter);
        font-size: var(--te-font-size-b14);
        align-items: center;
        .wpmnct-wrap-center-label {
          flex: 1 1 0;
          color: var(--te-text-color-secondary);
          display: -webkit-box; /* 开启弹性盒子布局 */
          -webkit-box-orient: vertical; /* 纵向排列子元素 */
          -webkit-line-clamp: 2; /* 限制显示的行数为2 */
          overflow: hidden; /* 溢出隐藏 */
          text-overflow: ellipsis; /* 省略号 */
        }
        > svg {
          flex: 0 0 16px;
        }
      }
    }
  }
  :hover.wpmnct-wrap {
    .wpmnct-wrap-left,
    .wpmnct-wrap-right {
      display: flex;
    }
    .wnt-wrap-name-edit-icon {
      display: block;
    }
    .wnt-wrap-delete-icon {
      display: block;
    }
  }
  .wpm-node-conditon-task-line {
    width: 2px;
    height: 10px;
  }
  .wpm-error-icon {
    position: absolute;
    right: -28px;
    top: 36px;
    width: 18px;
    height: 18px;
    color: var(--te-color-danger);
  }
}
.wpmnct-wrap-center-label {
  white-space: pre-line;
}
</style>
