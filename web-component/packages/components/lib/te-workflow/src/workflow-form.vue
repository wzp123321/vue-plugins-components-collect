<template>
  <te-config-provider :locale="zhCn">
    <div class="workflow-form">
      <template v-for="item in formWidgetInstanceList">
        <div
          v-if="
            item.componentType !== FormComponentTypeEnum.DESCRIPTION &&
            item.permission !== FormFieldPermissionEnum.HIDDEN
          "
          :class="[
            'wf-item',
            'wf-span' + item.span,
            {
              'wf-textarea': item.componentType === FormComponentTypeEnum.TEXT_AREA,
              'wf-file':
                item.componentType === FormComponentTypeEnum.FILE ||
                item.componentType === FormComponentTypeEnum.VIDEO ||
                item.componentType === FormComponentTypeEnum.IMAGE,
            },
          ]"
        >
          <div class="wf-item-label">
            <span
              class="wf-item-label-required"
              v-if="item.required && item.permission === FormFieldPermissionEnum.EDIT && !isView"
            >
              *
            </span>
            <span class="wf-item-label-text" :title="item.label">{{ item.label }}</span>
          </div>
          <div class="wf-item-value">
            <form-item :item="item" :axios="axios" :tenant-id="tenantId" :is-view="isView"></form-item>
          </div>
          <!-- 日期范围控件所带的时长控件label -->
          <div class="wf-item-label" v-if="item.componentType === FormComponentTypeEnum.DATE_TIME_RANGE">
            <span class="wf-item-label-text" :title="item.dateTimeRange?.durationLabel">{{
              item.dateTimeRange?.durationLabel
            }}</span>
          </div>
          <!-- 日期范围控件所带的时长控件value -->
          <div class="wf-item-duriation" v-if="item.componentType === FormComponentTypeEnum.DATE_TIME_RANGE">
            <!-- 数字输入框 -->
            <te-input-number
              v-if="!isView"
              class="wf-item-duriation-number"
              :model-value="item.valueConverTime"
              :min="0"
              :max="999999999999999"
              :disabled="
                item.permission === FormFieldPermissionEnum.READ_ONLY ||
                !item.dateTimeRange?.canModifyDuration ||
                isView
              "
              placeholder="自动计算"
              @update:model-value="durationTimeChange($event, item)"
            ></el-input-number>
            <div v-else>{{ item.valueConverTime }}</div>
            <span class="wf-item-duriation-unit">{{
              item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE_TIME ? '小时' : '天'
            }}</span>
          </div>
        </div>

        <!-- 说明文本 -->
        <div v-else="item.componentType === FormComponentTypeEnum.DESCRIPTION" class="wf-description wf-span24">
          {{ item.description?.placeholder }}
        </div>
      </template>
    </div>
  </el-config-provider>
</template>
<script setup lang="ts">
//@ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { onMounted, ref } from 'vue';
import { ElConfigProvider, ElInputNumber, ElMessage } from 'element-plus';
import WorkflowApi from './apis/WorkflowApi';
import GetTaskDetailRequestDTO from '../../models/GetTaskDetailRequestDTO';
import TaskDetailDTO from '../../models/TaskDetailDTO';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
import TaskDetailListQdDTO from '../../models/TaskDetailListQdDTO';
import { Axios } from 'axios';
import FormWidgetInstance from './models/FormWidgetInstance_local';
import { FormComponentTypeEnum } from '../../models/FormComponentTypeEnum';
import { TimeFormatTypeEnum } from '../../models/TimeFormatTypeEnum';
import { FormFieldPermissionEnum } from '../../models/FormFieldPermissionEnum';
import FormItem from './components/form-item.vue';
const props = defineProps<{
  axios: Axios;
  taskInstanceId: string;
  processInstanceId?: string;
  tenantId: string;
  taskDetail?: TaskDetailDTO;
  isView?: boolean;
}>();
onMounted(() => {
  if (props.taskDetail) {
    taskBaseInfo.value = props.taskDetail;
    getFormInstance(
      taskBaseInfo.value?.formExtraInfo?.formInstanceId || '',
      taskBaseInfo.value?.formExtraInfo?.processNodeId || ''
    );
  } else {
    initData();
  }
});
const formWidgetInstanceList = ref<FormWidgetInstance[]>([]);
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
 * 获取任务详情
 */
const getTaskDetail = () => {
  if (!taskId) {
    return;
  }
  let param = new GetTaskDetailRequestDTO();
  param.taskInstanceIdEq = taskId;
  param.fetchParts = ['FORM'];
  props.axios &&
    WorkflowApi.getTaskDetail(props.axios!, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        taskBaseInfo.value = data.data || taskBaseInfo.value;
        getFormInstance(data.data?.formExtraInfo?.formInstanceId || '', data.data?.formExtraInfo?.processNodeId || '');
      }
    });
};
/**
 * 获取表单实例
 */
const getFormInstance = (formInstanceId: string, processNodeId: string) => {
  if (!formInstanceId) {
    return;
  }
  props.axios &&
    WorkflowApi.queryFormInstance(props.axios!, props.tenantId || '', {
      formInstanceId: formInstanceId,
      processNodeId: processNodeId,
    }).then((data) => {
      if (data.errcode === '0') {
        FormWidgetInstance.convertOfList(
          formWidgetInstanceList,
          data.data?.children || [],
          props.axios,
          props.tenantId
        );
      }
    });
};
const reload = () => {
  initData();
};
/**
 * 校验必填
 */
const validate = () => {
  let result = formWidgetInstanceList.value.some((item) => {
    if (item.required && item.permission === FormFieldPermissionEnum.EDIT && !item.value) {
      ElMessage.error('请填写必填项');
      return true;
    }
  });
  return !result;
};
const getData = () => {
  let result: { [p: string]: { [p: string]: string } } = {};
  result[taskBaseInfo.value.formExtraInfo?.formInstanceId || ''] = {};
  // taskBaseInfo.value.formExtraInfo?.formInstanceId:formWidgetInstanceList.value.map((item) => ({ key: item.key, value: item.value })) ;
  formWidgetInstanceList.value.forEach((item) => {
    result[taskBaseInfo.value.formExtraInfo?.formInstanceId || ''][item.key || ''] =
      item.value !== null && item.value !== undefined ? item.value + '' : '';
  });

  console.log('formData::::', result);
  return result;
};
defineExpose({ reload, validate, getData });

/*****************************日期选择 start******************************** */
/**
 * 时间范围的时长手动输入
 * @param $event
 * @param item
 */
const durationTimeChange = ($event: number, item: FormWidgetInstance) => {
  item.valueConverTime = $event;
  if (item.valueConver) {
    item.value =
      (item.valueConver as Date[])[0].getTime() +
      ',' +
      (item.valueConver as Date[])[1].getTime() +
      ',' +
      item.valueConverTime;
  }
};
/*****************************日期选择 end******************************** */
</script>

<style scoped lang="less">
.workflow-form {
  .wf-item {
    display: inline-flex;
    height: 48px;
    border: 1px solid var(--te-border-color);
    margin-top: -1px;
    vertical-align: bottom;
    &-label {
      padding: 0 var(--te-space-12);
      flex: 0 0 145px;
      font-weight: 600;
      background-color: var(--te-fill-color-light);
      border-right: 1px solid var(--te-border-color);
      display: flex;
      align-items: center;
      &-required {
        color: #ff0000;
        margin-right: 5px;
      }
      &-text {
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        line-height: 18px;
        overflow: hidden;
        word-break: break-all;
      }
    }
    &-value {
      padding: 6px var(--te-space-12);
      flex: 1 1 0;
      display: flex;
      align-items: center;
      overflow: hidden;
      > :deep(*) {
        width: 100%;
      }
    }
    &-duriation {
      padding: 6px 12px;
      display: flex;
      flex: 1 1 0;
      align-items: center;
      &-number {
        flex: 1 1 0;
        margin-right: 10px;
      }
    }
  }
  .wf-textarea {
    height: auto;
    min-height: 48px;
    .wf-item-label {
      white-space: normal;
    }
  }
  .wf-file {
    min-height: 48px;
    height: auto;
  }
  .wf-description {
    color: var(--te-text-color-regular);
    font-size: var(--te-font-size-b14);
    line-height: 32px;
  }
  .wf-span12 {
    width: 50%;
  }
  .wf-span24 {
    width: 100%;
  }
}
</style>
