<template>
  <div class="workflow-baseinfo">
    <div class="wb-info-item">
      <div class="wb-info-item-label">任务标题</div>
      <div class="wb-info-item-value">{{ taskBaseInfo.summary }}</div>
    </div>
    <div class="wb-info-item">
      <div class="wb-info-item-label">任务描述</div>
      <div class="wb-info-item-value">{{ taskBaseInfo.description }}</div>
    </div>
    <div class="wb-info-item">
      <div class="wb-info-item-label">抄送人</div>
      <div class="wb-info-item-value">{{ getCCName(taskBaseInfo.ccs ?? []) }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import WorkflowApi from './apis/WorkflowApi';
import GetTaskDetailRequestDTO from '../../models/GetTaskDetailRequestDTO';
import TaskDetailDTO from '../../models/TaskDetailDTO';
import IdName from '../../models/IdName';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
import TaskDetailListQdDTO from '../../models/TaskDetailListQdDTO';
import { Axios } from 'axios';
const props = defineProps<{
  axios: Axios;
  taskInstanceId: string;
  processInstanceId?: string;
  tenantId: string;
  taskDetail?: TaskDetailDTO;
}>();
onMounted(() => {
  if (props.taskDetail) {
    taskBaseInfo.value = props.taskDetail;
  } else {
    initData();
  }
});
//获取数据
const initData = () => {
  if (!props.taskInstanceId) {
    getTaskId();
  } else {
    taskId = props.taskInstanceId;
    getTaskDetail();
  }
};
const taskBaseInfo = ref<TaskDetailDTO>(new TaskDetailDTO());
/**
 * processInstanceId换taskInstanceId
 */
const getTaskId = () => {
  if (!props.processInstanceId) {
    return;
  }
  let param = new TaskDetailListQdDTO();
  param.processInstanceIdEq = props.processInstanceId;
  param.typeEq = MyTaskTypeEnum.TODO;
  props.axios &&
    WorkflowApi.queryTaskDetailForList(props.axios, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        if (data.data && data.data.length > 0) {
          taskId = data.data[0].taskInstanceId || '';
          getTaskDetail();
        }
      }
    });
};
let taskId = '';
/**
 * 获取按钮列表
 */
const getTaskDetail = () => {
  if (!taskId) {
    return;
  }
  let param = new GetTaskDetailRequestDTO();
  param.taskInstanceIdEq = taskId;
  props.axios &&
    WorkflowApi.getTaskDetail(props.axios!, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        taskBaseInfo.value = data.data || taskBaseInfo.value;
      }
    });
};
const getCCName = (ccs: IdName[]) => {
  let result = '';
  ccs &&
    ccs.forEach((item) => {
      result += (result ? ',' : '') + item.name;
    });
  return result;
};
const reload = () => {
  initData();
};

defineExpose({ reload });
</script>

<style scoped lang="less">
.workflow-baseinfo {
  .wb-info-item {
    display: flex;
    line-height: 48px;
    border-top: 1px solid var(--te-border-color);
    border-left: 1px solid var(--te-border-color);
    border-right: 1px solid var(--te-border-color);
    &-label {
      padding-left: var(--te-space-12);
      flex: 0 0 145px;
      font-weight: 600;
      background-color: var(--te-fill-color-light);
      border-right: 1px solid var(--te-border-color);
    }
    &-value {
      padding-left: var(--te-space-12);
      flex: 1 1 0;
      word-break: break-all;
    }
  }
  > :last-child {
    border-bottom: 1px solid var(--te-border-color);
  }
}
</style>
