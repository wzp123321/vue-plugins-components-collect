<template>
  <div :class="body ? 'hlms-workflow-detail-body' : 'hlms-workflow-detail'" @click="close()">
    <div :class="body ? 'hwd-content-body' : 'hwd-content'" @click="noClose">
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
            @click="confirm"
          ></workflow-button>
        </div>
      </div>
      <div class="hwdb-body">
        <div v-if="selectTab === 1">
          <workflow-baseinfo
            v-if="taskId"
            :task-instance-id="taskId"
            :process-instance-id="processInstanceId"
            :axios="axios"
            :tenant-id="tenantId"
          ></workflow-baseinfo>
          <div class="hwdb-remark">
            <te-input placeholder="请输入备注" v-model="remark"></te-input>
          </div>
        </div>
        <workflow-log
          v-else-if="selectTab === 2"
          :process-instance-id="processInstanceId"
          :axios="axios"
          :tenant-id="tenantId"
        ></workflow-log>
        <workflow-graph
          v-else-if="selectTab === 3"
          :process-instance-id="processInstanceId"
          :axios="axios"
          :tenant-id="tenantId"
        ></workflow-graph>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TeInput } from '@tiansu/element-plus';
import WorkflowLog from './workflow-log.vue';
import WorkflowButton from './workflow-button.vue';
import WorkflowBaseinfo from './workflow-baseinfo.vue';
import WorkflowGraph from './workflow-graph-doc.vue';
import ActionButton from '../../models/ActionButton';
import WorkflowApi from './apis/WorkflowApi';
import CompleteTaskRequestDTO from '../../models/CompleteTaskRequestDTO';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
import TaskDetailListQdDTO from '../../models/TaskDetailListQdDTO';
import { Axios } from 'axios';
const props = withDefaults(
  defineProps<{
    body: Boolean;
    //自己的任务详情页面，taskInstanceId不会为空
    taskInstanceId: string;
    processInstanceId: string;
    //身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人
    identityType: string[];
    axios: Axios;
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
  }
});
const selectTab = ref(1);
const remark = ref('');
/**
 * processInstanceId换taskInstanceId
 */
const getTaskId = () => {
  let param = new TaskDetailListQdDTO();
  param.processInstanceIdEq = props.processInstanceId;
  param.typeEq = MyTaskTypeEnum.TODO;
  props.axios &&
    WorkflowApi.queryTaskDetailForList(props.axios, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        if (data.data && data.data.length > 0) {
          taskId.value = data.data[0].taskInstanceId;
        }
      }
    });
};
const taskId = ref('');
const confirm = (button: ActionButton) => {
  // 处理任务时paramMap可传递的参数：
  // actionButtonCode   按钮id
  // comment     备注
  // handOverToEmployeeId   任务要转交到的员工id -- 转交时必传
  // reason   终止、撤销任务的原因  -- 终止、撤销时必传
  // rejectInfo  驳回节点信息 -- 驳回时必传，类型为RejectInfo
  // backAppointOperator   由上一执行人指定的可操作人
  let param = new CompleteTaskRequestDTO();
  param.processInstanceId = props.processInstanceId;
  param.taskInstanceId = taskId.value;
  param.requestId = new Date().getTime() + '';
  param.processActionCode = button.processAction.processActionCode;
  param.paramMap = {
    comment: remark.value,
    actionButtonCode: button.code,
    rejectInfo: button.processAction.rejectInfo,
  };
  WorkflowApi.handleTask(props.axios, props.tenantId, param).then((data) => {
    if (data.errcode === '0') {
      emits('confirm', data);
    } else {
      emits('cancel', data.errmsg);
    }
  });
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
    width: 1000px;
    height: 70%;
    background-color: #ffffff;
    overflow: auto;
    display: flex;
    flex-direction: column;
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
  padding: 24px 20px 0 20px;
  .hwdb-remark {
    margin-top: 24px;
    background-color: var(--te-color-info-light-9);
    padding: 12px 20px;
  }
}
</style>
