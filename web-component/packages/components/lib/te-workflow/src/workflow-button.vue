<template>
  <div
    :class="[
      'optionDiv',
      { 'workflow-button-order': order === 'right-left' },
      useScene === 'table' ? 'workflow-button-table' : 'workflow-button-detail',
    ]"
  >
    <te-button
      class="wb-perbutton"
      v-if="useScene === 'table'"
      v-for="button in perButton"
      link
      type="primary"
      @click="buttonClick(button, $event)"
    >
      {{ button.name }}
    </te-button>
    <te-button
      class="wb-perbutton"
      v-else
      v-for="button in perButton"
      :plain="button.style !== ButtonStyle.STRONG_PRIMARY && button.style !== ButtonStyle.STRONG_DANGER"
      :type="getButtonType(button.style || '')"
      @click="buttonClick(button, $event)"
    >
      {{ button.name }}
    </te-button>
    <te-dropdown v-if="moreButton.length > 0">
      <te-button class="wb-dropdown-button" v-if="useScene === 'table'" link type="primary">更多</te-button>
      <div class="wb-dropdown-button" v-else>更多</div>
      <template #dropdown>
        <te-dropdown-menu>
          <te-dropdown-item v-for="button in moreButton">
            <span @click="buttonClick(button, $event)">
              {{ button.name }}
            </span>
          </te-dropdown-item>
        </te-dropdown-menu>
      </template>
    </te-dropdown>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { TeButton, TeDropdown, TeDropdownMenu, TeDropdownItem, TeMessage } from '@tiansu/element-plus';
import WorkflowApi from './apis/WorkflowApi';
import { ButtonStyle, TerminalType } from './models/enum/workflow';
import ActionButton from '../../models/ActionButton';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
import QueryActionInfoRequestDTO from '../../models/QueryActionInfoRequestDTO';
import TaskDetailListQdDTO from '../../models/TaskDetailListQdDTO';
import { Axios } from 'axios';
const props = withDefaults(
  defineProps<{
    axios: Axios;
    //任务id,身份是执行人时必填
    taskInstanceId?: string;
    //流程实例id,身份是发起人时必填
    processInstanceId?: string;
    //身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人
    identityType?: string[];
    tenantId: string;
    //使用场景，根据使用场景不同，按钮渲染不同样式，table-用在表格操作列，detail-用再详情页
    useScene?: string;
    //排序，right-left:从右往左渲染，left-right:从左往右渲染
    order?: string;
    //收到更多里面的数量边界，默认超过4个的按钮就收到更多弹窗中
    moreBound?: number;
    //业务自定义的非流程按钮，组件内帮助渲染(渲染再流程按钮之前)
    extraButtons?: ActionButton[];
    //业务自定义的非流程按钮，组件内帮助渲染(渲染再流程按钮之后)
    backExtraButtons?: ActionButton[];
    //刷新标识,此值变更时，组件内部会重新调用获取按钮的接口来刷新按钮
    reloadFlag?: number | string;
    //当前的终端编码，【天溯】产品模块管理文档中定义的终端编码
    terminalId?: string;
    //按钮不可用时的配置：hidden=默认值，隐藏按钮；visible=直接显示按钮，点击后交由业务侧去执行；tip=点击弹窗一个固定提示语，不再交由业务侧执行。
    //不可用判定：按钮关联了界面动作，且界面动作中的jumpInfos所支持的终端id不包含当前终端id。 需要terminalId参数不为空，terminalId不传判定为可用
    unSuppertedMode?: string;
    //是否是作为流程按钮组件使用，如果是则获取流程按钮，不是则只渲染extraButtons和backExtraButtons传进来的按钮，默认为true
    asWorkflowButton?: boolean;
  }>(),
  {
    identityType: () => [MyTaskTypeEnum.TODO],
    useScene: 'detail',
    order: 'left-right',
    moreBound: 4,
    reloadFlag: 1,
    unSuppertedMode: 'hidden',
    asWorkflowButton: true,
  }
);
const emits = defineEmits(['click']);
let taskId = '';
onMounted(() => {
  initData();
});
//获取数据
const initData = () => {
  if (!props.asWorkflowButton) {
    return;
  }
  taskId = '';
  buttonList.value = [];
  if (props.identityType.indexOf(MyTaskTypeEnum.TODO) > -1 && !props.taskInstanceId) {
    //身份包含执行人且任务id为空时，用流程id去换任务id
    getTaskId();
  } else {
    taskId = props.taskInstanceId || '';
    queryActionInfo();
  }
};
watch(
  () => (props.taskInstanceId || '') + (props.processInstanceId || '') + (props.reloadFlag || ''),
  () => {
    console.log('taskInstanceId change', props.taskInstanceId);
    initData();
  }
);
const buttonList = ref<(ActionButton & { isSupperted: boolean })[]>([]);
const perButton = computed(() => {
  let bList = [...(props.extraButtons || [])];
  bList.push(...buttonList.value);
  bList.push(...(props.backExtraButtons || []));
  if (bList.length > props.moreBound) {
    return bList.slice(0, props.moreBound - 1);
  } else {
    return bList;
  }
});
const moreButton = computed(() => {
  let bList = [...(props.extraButtons || [])];
  bList.push(...buttonList.value);
  bList.push(...(props.backExtraButtons || []));
  if (bList.length > props.moreBound) {
    return bList.slice(props.moreBound - 1);
  } else {
    return [];
  }
});
/**
 * 根据按钮类型，渲染不同按钮样式
 * @param code 按钮类型
 */
const getButtonType = (style: string) => {
  if (style === ButtonStyle.PRIMARY || style === ButtonStyle.STRONG_PRIMARY || style === 'primary') {
    return 'primary';
  } else if (style === ButtonStyle.DANGER || style === ButtonStyle.STRONG_DANGER || style === 'danger') {
    return 'danger';
  } else {
    return 'default';
  }
};
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
          queryActionInfo();
        }
      }
    });
};
/**
 * 获取按钮列表
 */
const queryActionInfo = () => {
  if (
    (props.identityType.indexOf(MyTaskTypeEnum.TODO) > -1 && !taskId) ||
    (props.identityType.indexOf('STARTER') > -1 && !props.processInstanceId)
  ) {
    return;
  }
  let param = new QueryActionInfoRequestDTO();
  param.processInstanceIdEq = props.processInstanceId;
  param.taskInstanceIdEq = taskId;
  param.fetchParts = [];
  if (props.identityType.indexOf('STARTER') > -1) {
    param.fetchParts.push('STARTER');
  }
  if (props.identityType.indexOf(MyTaskTypeEnum.TODO) > -1) {
    param.fetchParts.push('OPERATOR');
  }
  if (param.fetchParts.length === 0) {
    return;
  }
  props.axios &&
    WorkflowApi.queryActionInfo(props.axios!, props.tenantId || '', param).then((data) => {
      if (data.errcode === '0') {
        buttonList.value = [];
        props.identityType.forEach((type) => {
          if (type === MyTaskTypeEnum.TODO) {
            buttonList.value.push(...setIsSupperted(data.data?.operatorActionButtons || [])) ;
          } else if (type === 'STARTER') {
            buttonList.value.push(...setIsSupperted(data.data?.starterActionButtons || []));
          }
        });
      }
    });
};
/**
 * 设置按钮在本终端是否支持
 * @param buttons 按钮列表
 */
const setIsSupperted = (buttons: ActionButton[]) => {
  let result: (ActionButton & { isSupperted: boolean })[] = [];
  //分两各版本：1.第一个版本是根据按钮的jumpInfos中的supportTerminalTypes判断
  //2.第二个版本是根据按钮的jumpInfos中的supportTerminalIds判断，第二个版本需要外部传入的terminalId参数不为空
  //本组件终端类型固定是PC_WEB，因为本组件只用在PC_WEB终端，
  let terminalType = TerminalType.PC_WEB;
  buttons?.forEach((button) => {
    let isSuppertedButton = { ...button, isSupperted: false };
    if (button.uiActionV2 && button.uiActionV2.jumpInfos) {
      for (let i = 0; i < button.uiActionV2.jumpInfos.length; i++) {
        //遍历jumpInfos，找到第一个支持本终端的跳转信息，只要有一个jumpInfo支持本终端，就认为本按钮支持本终端
        let jumpInfo = button.uiActionV2.jumpInfos[i];
        if (jumpInfo.supportTerminalIds && jumpInfo.supportTerminalIds.includes(props.terminalId || '')) {
          //优先使用第二个版本的supportTerminalIds,
          isSuppertedButton.isSupperted = true;
          //通过设置i的值跳出循环
          i = button.uiActionV2.jumpInfos.length;
        } else if (
          jumpInfo.supportTerminalTypes &&
          converTerminalType(jumpInfo.supportTerminalTypes).includes(terminalType)
        ) {
          //再兼容第一个版本的supportTerminalTypes，
          isSuppertedButton.isSupperted = true;
          //通过设置i的值跳出循环
          i = button.uiActionV2.jumpInfos.length;
        } else if (!jumpInfo.supportTerminalTypes && (!jumpInfo.supportTerminalIds || !props.terminalId)) {
          //supportTerminalIds,supportTerminalTypes都为空判定为支持
          isSuppertedButton.isSupperted = true;
          //通过设置i的值跳出循环
          i = button.uiActionV2.jumpInfos.length;
        }
      }
    } else {
      //uiActionV2和uiActionV2.jumpInfos为空，即未配置界面动作，或配置了界面动作，但界面动作中跳转信息为空，则判定为支持
      isSuppertedButton.isSupperted = true;
    }
    result.push(isSuppertedButton);
  });
  //过滤掉不支持且不支持时需要隐藏的按钮
  result = result.filter((button) => {
    if (!button.isSupperted && props.unSuppertedMode === 'hidden') {
      return false;
    } else {
      return true;
    }
  });
  return result;
};
/**
 * 将后端错误的终端类型值转换成产品定义的正确的终端类型值
 * @param types 终端类型列表
 */
const converTerminalType = (types: string[]) => {
  return types.map((type) => {
    switch (type) {
      case 'TIANSUWEB':
        return TerminalType.PC_WEB;
      default:
        return type;
    }
  });
};

/**
 * 点击事件
 * @param button 按钮
 */
const buttonClick = (button: ActionButton & { isSupperted: boolean }, event: Event) => {
  if (button.isSupperted === false) {
    if (props.unSuppertedMode === 'tip') {
      TeMessage.error('本终端不支持此操作');
    } else if (props.unSuppertedMode === 'auto' || props.unSuppertedMode === 'visible') {
      let b1 = { ...button }
      delete b1.isSupperted;
      emits('click', b1, event);
    }
  } else {
    let b1 = { ...button }
      delete b1.isSupperted;
    emits('click', b1, event);
  }
};
const reload = () => {
  initData();
};

defineExpose({ reload });
</script>

<style scoped lang="less">
.workflow-button-table.workflow-button-order {
  flex-direction: row-reverse;
  > * {
    margin-left: 16px !important;
    margin-right: 0px !important;
  }
  > :last-child {
    margin-left: 0px !important;
  }
}
.workflow-button-table.optionDiv {
  white-space: nowrap;
  box-sizing: border-box;
}
.workflow-button-table {
  display: flex;
  align-items: center;
  > *,
  .wb-perbutton {
    margin-right: 16px;
    margin-left: 0;
    line-height: 22px;
  }
  > :last-child {
    margin-right: 0px;
  }
  .wb-dropdown-button {
    line-height: 22px;
  }
}
.workflow-button-detail.workflow-button-order {
  flex-direction: row-reverse;
  > * {
    margin-left: 12px !important;
    margin-right: 0px !important;
  }
  > :last-child {
    margin-left: 0px !important;
  }
}
.workflow-button-detail {
  display: flex;
  align-items: center;
  > *,
  .wb-perbutton {
    margin-right: 12px;
    margin-left: 0;
  }
  > :last-child {
    margin-right: 0px;
  }
  .wb-dropdown-button {
    width: 60px;
    cursor: pointer;
    text-align: center;
  }
}
</style>
