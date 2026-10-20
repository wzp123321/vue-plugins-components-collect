<template>
  <div class="workflow-log">
    <div class="workflow-log-export">
      <te-dropdown>
        <te-button class="workflow-log-button" type="default" plain>
          导出图片
          <icon-down class="pl-header-dropdown-icon" />
        </te-button>
        <template #dropdown>
          <te-dropdown-menu>
            <te-dropdown-item @click="handleExport('JPG')">JPG</te-dropdown-item>
            <te-dropdown-item @click="handleExport('PNG')">PNG</te-dropdown-item>
            <te-dropdown-item @click="handleExport('SVG')">
              SVG&nbsp;&nbsp;
              <te-popover placement="top-start" trigger="hover" content="矢量图形格式，缩放不会变形，可用浏览器打开">
                <template #reference>
                  <icon-explain></icon-explain>
                </template>
              </te-popover>
            </te-dropdown-item>
          </te-dropdown-menu>
        </template>
      </te-dropdown>
    </div>
    <te-table
      id="workflow-log-table"
      :data="logList"
      :span-method="spanMethod"
      :cell-style="{ background: 'revert' }"
      header-cell-class-name="wl-table-header"
    >
      <te-table-column label="节点名称" prop="nodeName" min-width="200"> </te-table-column>
      <te-table-column label="处理人" prop="handlerName" min-width="200">
        <template #default="{ row }">
          <workflow-log-handler
            :handlers="row.handlers || []"
            :ccs="row.ccs"
            :handOverTo="row.handOverTo"
            :approveType="row.approveType"
            :nodeType="row.nodeType"
            :actionName="row.actionName"
            :axios="axios"
            :tenant-id="tenantId"
          />
        </template>
      </te-table-column>
      <te-table-column label="处理动作" prop="actionName" min-width="100">
        <template #default="{ row }">
          <div class="wl-status-tag wl-status-inprogress" v-if="row.actionName === '处理中'">
            {{ row.actionName }}
          </div>
          <div v-else-if="row.nodeType === ProcessNodeTypeEnum.END_EVENT" class="wl-status-simple">
            {{ row.actionName }}
          </div>
          <div v-else :class="['wl-status-tag', { 'wl-status-success': row.actionName }]">
            {{ row.actionName }}
          </div>
        </template>
      </te-table-column>
      <te-table-column label="备注" class-name="wl-table-comment" prop="comment" min-width="100" max-width="320">
        <template #default="{ row, $index }">
          <div>{{ row.comment || '-' }}</div>
          <div class="wl-table-comment-content">
            <template v-for="(img, index) in row.attachments">
              <span class="wl-table-comment-item" v-if="index < 4">
                <te-image
                  :ref="
                    (el) => {
                      refs[$index][index] = el;
                    }
                  "
                  class="wl-table-comment-item-img"
                  :z-index="9000"
                  :initial-index="index"
                  :src="img.fileUrl"
                  :preview-teleported="true"
                  :preview-src-list="getImgList(row.attachments)"
                >
                </te-image>
                <span
                  class="wl-table-comment-item-actions"
                  :class="{ 'wl-table-comment-item-more': index === 3 && row.attachments.length > 4 }"
                >
                  <icon-zoom-in class="wl-table-comment-item-actions-action" @click="handleImgClick($index, index)" />
                  <span v-if="index === 3" class="wl-table-comment-item-actions-number">
                    +{{ row.attachments.length - 4 }}
                  </span>
                </span>
              </span>
            </template>
          </div>
        </template>
      </te-table-column>
      <te-table-column label="处理时间" prop="createTime" min-width="200">
        <template #default="{ row }">
          <div class="wl-time">
            <div class="wl-time-spend" :style="{ fontSize: row.completeTime ? '12px' : '14px' }">
              耗时 {{ diffTimeFormat(row.createTime, row.completeTime) }}
              <te-tag
                v-if="
                  (row.nodeType === ProcessNodeTypeEnum.USER_TASK || row.nodeType === ProcessNodeTypeEnum.OUTER_FLOW) &&
                  typeof row.timeout === 'number'
                "
                type="warning"
                size="small"
                class="wl-time-tag"
                >超时
              </te-tag>
            </div>
            <div v-if="row.completeTime" class="wl-time-complete">
              {{ createTimeFormat(row.completeTime) }}
            </div>
          </div>
        </template>
      </te-table-column>
    </te-table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import moment from 'moment';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import {
  TeTag,
  TeTable,
  TeTableColumn,
  TeButton,
  TeDropdown,
  TeDropdownItem,
  TePopover,
  TeImage,
  TeDropdownMenu
} from '@tiansu/element-plus';
import WorkflowLogHandler from './components/workflow-log-handler.vue';
import WorkflowApi from './apis/WorkflowApi';
import ProcessNodeActivityLogDTO from '../../models/ProcessNodeActivityLogDTO';
import TaskActivityLogDTO from '../../models/TaskActivityLogDTO';
import { ProcessNodeTypeEnum } from '../../models/ProcessNodeTypeEnum';
import { type AxiosInstance } from 'axios';
import { IconExplain, IconDown, IconZoomIn, IconDownload } from '@arco-iconbox/vue-te/esm';
import TaskAttachmentDTO from '../../models/TaskAttachmentDTO';

const props = defineProps<{
  axios: AxiosInstance;
  processInstanceId: string;
  tenantId: string;
}>();

onMounted(() => {
  getProcessInstanceActivityLog();
});

interface ListItem extends ProcessNodeActivityLogDTO, TaskActivityLogDTO {}
const logList = ref<ListItem[]>([]);
/**
 * 获取流程日志
 */
const getProcessInstanceActivityLog = () => {
  if (props.axios && props.processInstanceId) {
    WorkflowApi.getProcessInstanceActivityLog(props.axios!, props.tenantId || '', {
      processInstanceId: props.processInstanceId || '',
    }).then((data) => {
      if (data.errcode === '0') {
        logList.value = data.data?.nodeActivityLogs
          .map((item) => {
            return item.taskActivityLogs.map((log, index) => {
              return {
                rowspan: index === 0 ? item.taskActivityLogs.length : 0,
                colspan: index === 0 ? 1 : 0,
                ...item,
                ...log,
              };
            });
          })
          .flat();
        refs.value = new Array(logList.value.length).fill(0).map(() => {
          return [];
        });
      }
    });
  }
};
//拿到备注图片地址列表
const getImgList = (attachments: TaskAttachmentDTO[]) => {
  return (attachments || []).map((item) => {
    return item.fileUrl;
  });
};
const refs = ref();
const handleImgClick = ($index: number, index: number) => {
  if (refs.value[$index][index]) {
    refs.value[$index][index].$el.querySelector('img').click();
  }
};

// 根据nodeId合并节点名称单元格
const spanMethod = ({
  row,
  rowIndex,
  columnIndex,
}: {
  row: { rowspan: number; colspan: number };
  rowIndex: number;
  columnIndex: number;
}) => {
  if (columnIndex === 0) {
    return [row.rowspan, row.colspan];
  }
};
/**
 * 任务节点创建时间格式化
 * @param time 创建时间
 */
const createTimeFormat = (time?: number) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '';
};
/**
 * 流程任务节点持续时间
 * @param item1 任务节点创建时间
 * @param item2 任务节点完成时间，为空取当前时间
 */
const diffTimeFormat = (time1?: number, time2?: number) => {
  if (time1) {
    let result = '';
    time2 = time2 || new Date().getTime();
    let diff = Math.ceil(moment(time2).diff(moment(time1), 'minutes', true));
    if (diff <= 0) {
      return '0分';
    } else if (diff < 1) {
      return '1分';
    }
    result = diff % 60 ? (diff % 60) + '分' : '';
    if (diff > 59) {
      diff = Math.floor(diff / 60);
      result = (diff % 24) + '小时' + result;
      if (diff > 23) {
        diff = Math.floor(diff / 24);
        result = (diff % 30) + '天' + result;
        if (diff > 29) {
          diff = Math.floor(diff / 30);
          result = (diff % 12) + '月' + result;
          if (diff > 11) {
            result = Math.floor(diff / 12) + '年' + result;
          }
        }
      }
    }
    return result;
  } else {
    return '';
  }
};

const handleExport = (type: string) => {
  let els = document.getElementById('workflow-log-table');
  if (els) {
    let callb = (dataUrl: string) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `流程日志_${moment().format('YYYYMMDD_HHmm')}`;
      a.click();
    };
    if (type === 'SVG') {
      toSvg(els as HTMLElement).then(callb);
    } else if (type === 'PNG') {
      toPng(els as HTMLElement).then(callb);
    } else if (type === 'JPG') {
      toJpeg(els as HTMLElement).then(callb);
    }
  }
};

const reload = () => {
  getProcessInstanceActivityLog();
};

defineExpose({ reload });
</script>

<style lang="less" scoped>
.workflow-log {
  height: 100%;
  display: flex;
  flex-direction: column;
  .workflow-log-export {
    text-align: right;
    margin-bottom: var(--te-space-12);
    .workflow-log-button {
      outline: none !important;
    }
  }
  #workflow-log-table {
    flex: 0 1 auto;
  }
  :deep(.wl-table-header) {
    background: var(--te-table-tr-bg-color);
    border-right: none !important;
    border-top: var(--te-table-border);
    height: 48px;
    color: var(--te-text-color-secondary);
    font-weight: 600;
  }
  :deep(.wl-table-comment) {
    .cell {
      white-space: pre-line;
    }
    &-content {
      position: relative;
      white-space: nowrap;
    }
    &-item {
      position: relative;
      display: inline-block;
      margin: 0 4px;
      width: 64px;
      height: 64px;
      &-img {
        width: 64px;
        height: 64px;
      }
      &-actions {
        top: 0;
        left: 0;
        position: absolute;
        width: 64px;
        height: 64px;
        color: #fff;
        font-size: 18px;
        display: flex;
        opacity: 0;
        align-items: center;
        justify-content: center;
        background-color: var(--te-overlay-color-lighter);
        &-action {
          cursor: pointer;
          margin: 0 4px;
        }
      }
      &-actions:hover {
        opacity: 1;
        .wl-table-comment-item-actions-action {
          display: initial;
        }
        .wl-table-comment-item-actions-number {
          display: none;
        }
      }
      &-more {
        opacity: 1 !important;
        .wl-table-comment-item-actions-action {
          display: none;
        }
      }
    }
  }
  .wl-status-tag {
    display: inline-block;
    padding: 0 10px;
    border-radius: 4px;
    font-size: var(--te-font-size-b12);
    text-align: center;
    line-height: 24px;
  }
  .wl-status-simple {
    color: var(--te-text-color-secondary);
    line-height: 22px;
  }
  .wl-status-tag.wl-status-inprogress {
    color: var(--te-color-primary);
    background: var(--te-color-primary-light-9);
  }
  .wl-status-tag.wl-status-success {
    color: var(--te-color-success);
    background: var(--te-color-success-light-9);
  }
  .wl-status-tag.wl-status-error {
    color: var(--te-color-danger);
    background: var(--te-color-danger-light-9);
  }
  .wl-status-tag.wl-time-spend {
    font-size: var(--te-font-size-b12);
    line-height: 20px;
    margin-bottom: var(--te-space-4);
  }
  .wl-time-tag {
    margin-left: var(--te-space-8);
  }
  .wl-time-complete {
    color: var(--te-text-color-secondary);
    font-size: var(--te-font-size-b12);
    line-height: 20px;
  }
}
</style>
