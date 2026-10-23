<template>
  <div :class="body ? 'hlms-workflow-detail-body' : 'hlms-workflow-detail'" v-loading="loading">
    <div :class="body ? 'hwd-content-body' : 'hwd-content'" @click="noClose">
      <div v-if="body" class="hwd-content-body-close">
        <te-button text @click="close()"><icon-close></icon-close></el-button>
      </div>
      <div class="hwdb-head">
        <div class="hwdb-head-tabs">
          <div class="hwdb-head-tabs-tab" :class="{ 'hwdb-head-tabs-stab': selectTab === 1 }" @click="selectTab = 1">
            任务内容
          </div>
          <div class="hwdb-head-tabs-tab" :class="{ 'hwdb-head-tabs-stab': selectTab === 2 }" @click="selectTab = 2">
            流程记录
          </div>
          <div class="hwdb-head-tabs-tab" :class="{ 'hwdb-head-tabs-stab': selectTab === 3 }" @click="selectTab = 3">
            流程图
          </div>
        </div>
        <div class="hwdb-head-buttons">
          <workflow-button
            v-if="taskId"
            :task-instance-id="taskId"
            :process-instance-id="processInstanceId"
            :identity-type="identityType"
            :axios="axios"
            :tenant-id="tenantId"
            order="right-left"
            @click="confirm"
          ></workflow-button>
        </div>
      </div>
      <div class="hwdb-body">
        <div v-show="selectTab === 1">
          <workflow-baseinfo
            v-if="taskDetail"
            :task-instance-id="taskId"
            :process-instance-id="processInstanceId"
            :axios="axios"
            :tenant-id="tenantId"
            :task-detail="taskDetail"
          ></workflow-baseinfo>
          <div class="hwdb-body-title" v-if="taskDetail?.formExtraInfo?.formInstanceId">
            <icon-title-decoration></icon-title-decoration>
            <span>表单信息</span>
          </div>
          <workflow-form
            ref="workflowForm"
            v-if="taskDetail?.formExtraInfo?.formInstanceId"
            :task-instance-id="taskId"
            :process-instance-id="processInstanceId"
            :axios="axios"
            :tenant-id="tenantId"
            :task-detail="taskDetail"
            :is-view="!identityType.includes(MyTaskTypeEnum.TODO) && !identityType.includes('STARTER')"
          ></workflow-form>
          <div
            class="hwdb-remark"
            v-if="identityType.includes(MyTaskTypeEnum.TODO) || identityType.includes('STARTER')"
          >
            <te-input placeholder="请输入备注" v-model="remark" :maxlength="200"></el-input>
          </div>
        </div>
        <workflow-log
          v-show="selectTab === 2"
          :process-instance-id="processInstanceId || ''"
          :axios="axios"
          :tenant-id="tenantId"
        ></workflow-log>
        <workflow-graph
          v-if="selectTab === 3"
          :process-instance-id="processInstanceId || ''"
          :axios="axios"
          :tenant-id="tenantId"
        ></workflow-graph>
      </div>
    </div>
    <te-employee
      v-model:visible="empVis"
      :selected="selectedEmployeeIds"
      :axiosInstance="axios"
      :tenantId="tenantId"
      @update:selected="employeeSelectChange"
    ></te-employee>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElInput, ElButton, vLoading, ElMessage } from 'element-plus';
import { IconClose, IconTitleDecoration } from '@arco-iconbox/vue-te/esm';
import { TeEmployee } from '../../te-employee';
import WorkflowLog from './workflow-log.vue';
import WorkflowButton from './workflow-button.vue';
import WorkflowBaseinfo from './workflow-baseinfo.vue';
import WorkflowGraph from './workflow-graph.vue';
import ActionButton from '../../models/ActionButton';
import WorkflowForm from './workflow-form.vue';
import WorkflowApi from './apis/WorkflowApi';
import CompleteTaskRequestDTO from '../../models/CompleteTaskRequestDTO';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
import TaskDetailListQdDTO from '../../models/TaskDetailListQdDTO';
import { type AxiosInstance } from 'axios';
import { ProcessActionCodeEnum } from '../../models/ProcessActionCodeEnum';
import GetTaskDetailRequestDTO from '../../models/GetTaskDetailRequestDTO';
import TaskDetailDTO from '../../models/TaskDetailDTO';
const props = withDefaults(
  defineProps<{
    body?: Boolean;
    //自己的任务详情页面，taskInstanceId不会为空
    taskInstanceId?: string;
    processInstanceId?: string;
    //身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人
    identityType?: string[];
    axios: AxiosInstance;
    tenantId: string;
  }>(),
  {
    identityType: () => [MyTaskTypeEnum.TODO],
  }
);
const emits = defineEmits(['cancel', 'confirm']);
onMounted(() => {
  if (!props.taskInstanceId) {
    //用流程id去换任务id
    getTaskId();
  } else {
    taskId.value = props.taskInstanceId;
    getTaskDetail();
  }
});
const selectTab = ref(1);
const taskId = ref('');
const remark = ref('');
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
          taskId.value = data.data[0].taskInstanceId || '';
          getTaskDetail();
        }
      }
    });
};
const taskDetail = ref<TaskDetailDTO>();
/**
 * 获取任务详情
 */
const getTaskDetail = () => {
  if (!taskId.value) {
    return;
  }
  let param = new GetTaskDetailRequestDTO();
  param.taskInstanceIdEq = taskId.value;
  param.fetchParts = ['FORM'];
  props.axios &&
    WorkflowApi.getTaskDetail(props.axios!, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        taskDetail.value = data.data || taskDetail.value;
      }
    });
};

let currentButton: ActionButton | undefined;
const workflowForm = ref();
const confirm = (button: ActionButton) => {
  currentButton = button;
  if (button.processAction?.processActionCode === ProcessActionCodeEnum.HAND_OVER) {
    //转交操作要选人
    empVis.value = true;
    return;
  } else if (workflowForm.value && !workflowForm.value.validate()) {
    //表单不为空且验证失败，不执行操作
    return;
  }
  completeTask();
  return;
};
//选人组件显示隐藏
const empVis = ref(false);
//选人组件选中的人员
const selectedEmployeeIds = ref<{ id: string }[]>([]);
/**
 * 选人组件选中人员点击确认按钮时触发
 * @param value 选中的人员
 */
const employeeSelectChange = (value: { id: string }[]) => {
  if (value.length > 0) {
    selectedEmployeeIds.value = value;
    completeTask();
  }
};
const loading = ref(false);
/**
 * 完成任务
 */
const completeTask = () => {
  let param = new CompleteTaskRequestDTO();
  // param.processInstanceId = props.processInstanceId;
  param.taskInstanceId = taskId.value;
  param.requestId = new Date().getTime() + '';
  param.processActionCode = currentButton?.processAction?.processActionCode;
  // 处理任务时paramMap可传递的参数：
  // actionButtonCode   按钮id
  // comment     备注
  // handOverToEmployeeId   任务要转交到的员工id -- 转交时必传
  // reason   终止、撤销任务的原因  -- 终止、撤销时必传
  // rejectInfo  驳回节点信息 -- 驳回时必传，类型为RejectInfo
  // backAppointOperator   由上一执行人指定的下一步执行人,给员工id
  param.paramMap = {
    comment: remark.value,
    actionButtonCode: currentButton?.code,
    rejectInfo: currentButton?.processAction?.rejectInfo,
    handOverToEmployeeId: selectedEmployeeIds.value[0]?.id || '',
  };
  param.formMap = workflowForm.value?.getData();
  loading.value = true;
  WorkflowApi.handleTask(props.axios, props.tenantId, param).then(
    (data) => {
      loading.value = false;
      if (data.errcode === '0') {
        ElMessage.success('操作成功');
        emits('confirm', data);
      } else {
        emits('cancel', data.errmsg);
      }
    },
    () => {
      loading.value = false;
    }
  );
};

/**
 * 点击空白,关闭
 */
const close = () => {
  props.body && emits('cancel', '取消执行');
};
/**
 * 点击侧边栏内容区域时，阻止事件传递到父元素，避免关闭
 * @param event 事件对象
 */
const noClose = (event: Event) => {
  if (props.body) {
    event.stopImmediatePropagation();
  }
};
</script>

<style scoped lang="less">
.hlms-workflow-detail-body {
  font-size: var(--te-font-size-base);
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--te-overlay-color-lighter);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  .hwd-content-body {
    width: 1200px;
    height: 90%;
    background-color: #ffffff;
    overflow: auto;
    display: flex;
    flex-direction: column;
    &-close {
      text-align: right;
      margin-right: 20px;
      > button {
        width: 32px;
      }
    }
  }
}
.hlms-workflow-detail {
  .hwd-content {
    background-color: #ffffff;
    overflow: auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
.hwdb-head {
  flex: 0 0 56px;
  display: flex;
  border-bottom: 1px solid var(--te-border-color-lighter);
  &-tabs {
    flex: 1 0 200px;
    display: flex;
    align-items: flex-end;
    &-tab {
      width: 96px;
      margin: 0 20px;
      height: 40px;
      line-height: 40px;
      text-align: center;
    }
    &-stab {
      border-bottom: 2px solid var(--te-color-primary);
    }
  }
  &-buttons {
    flex: 0 0 100px;
    line-height: 55px;
    margin-right: 20px;
    > div {
      height: 100%;
    }
  }
}
.hwdb-body {
  flex: 1 1 auto;
  overflow: auto;
  padding: 24px 20px 20px 20px;
  &-title {
    margin: 24px 0 12px;
    font-size: var(--te-font-size-h16);
    font-weight: 600;
    color: var(--te-text-color-primary);
    display: flex;
    align-items: center;
    > svg {
      margin-right: 10px;
      color: var(--te-color-primary);
    }
  }
  .hwdb-remark {
    margin-top: 24px;
    background-color: var(--te-color-info-light-9);
    padding: 12px 20px;
  }
}
</style>
