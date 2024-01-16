<template>
  <div class="adss-add">
    <header>
      <img @click="cancelStrategy" src="@/assets/img/assessment-department/ad-strategy-arrow.svg" alt="arrow" />
      <span>{{ addService.actionType.value }}分摊策略</span>
    </header>
    <div class="adssa-content">
      <div class="adssa-basic-info">
        <sub-title title="基本信息"></sub-title>
        <div class="adssa-form">
          <div>
            <div class="adssa-form-title">策略名称</div>
            <el-input
              v-inputFilter:search
              maxLength="20"
              v-model.trim="addService.strategyInfo.apportionedName"
              placeholder="请输入"
              :disabled="addService.disabledSure.value"
            ></el-input>
          </div>
          <div>
            <div class="adssa-form-title">能源类型</div>
            <el-select
              v-model="addService.strategyInfo.energyCode"
              fit-input-width
              :disabled="addService.disabledSure.value"
              @change="energyChange"
            >
              <el-option
                v-for="item in addService.energyList.value"
                :key="item.code"
                :label="item.name"
                :value="item.code"
                :title="item.name"
              />
            </el-select>
          </div>
          <div>
            <div class="adssa-form-title">分摊周期</div>
            <el-date-picker
              v-model="addService.strategyInfo.apportionedStartTime"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              :disabled-date="startDateDisabled"
              :disabled="addService.disabledSure.value"
            />
            <span class="adssa-separator">~</span>
            <el-date-picker
              v-model="addService.strategyInfo.apportionedEndTime"
              type="date"
              placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :disabled-date="endDateDisabled"
              :disabled="addService.disabledSure.value"
            />
          </div>
        </div>
      </div>
      <div class="adssa-rule-info">
        <sub-title title="规则信息"></sub-title>
        <div class="adssa-form">
          <div>
            <div class="adssa-form-title">
              <span>分摊源</span>
              <el-tooltip effect="dark" content="分摊源可选择多个点位或者以变量方式组合" placement="top">
                <img class="adssa-source-tip" src="@/assets/img/common/common-question-mark.svg" alt="mark" />
              </el-tooltip>
            </div>
            <div
              class="adssa-share-source"
              :class="{ 'adssa-share-source-disabled': addService.disabledSure.value }"
              @click.stop="openSourceDialog"
            >
              <ul>
                <li
                  v-for="(item, index) in addService.strategyInfo.apportionedSources"
                  :title="transSourceName(item)"
                  @click.stop="toShowSourceInfo(item, index)"
                >
                  {{ transSourceName(item) }}
                  <el-icon class="adssa-icon" @click.stop="deleteSourceVar(index)"><Close /></el-icon>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div class="adssa-form-title">分摊规则</div>
            <el-select
              v-model="addService.strategyInfo.apportionedRuleId"
              fit-input-width
              filterable
              :disabled="addService.disabledSure.value"
            >
              <el-option
                v-for="item in addService.shareRuleList.value"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                :title="item.name"
              />
            </el-select>
          </div>
          <div>
            <div class="adssa-form-title">分摊对象</div>
            <el-popover
              popper-class="adssa-popover"
              placement="top-start"
              :width="200"
              :show-arrow="false"
              trigger="click"
              :disabled="addService.disabledSure.value"
              v-model:visible="isShowPopover"
            >
              <share-object
                v-if="isShowPopover"
                @cancel="cancelObject"
                @sure="sureObject"
                :initObjectIds="initObjectItem"
                :init-object-type="addService.strategyInfo.apportionedObjectType"
              ></share-object>
              <template #reference>
                <div
                  class="adssa-share-source"
                  :class="{ 'adssa-share-source-disabled': addService.disabledSure.value }"
                  @click.stop="showObject"
                >
                  <ul>
                    <li
                      v-for="(item, index) in addService.strategyInfo.apportionedObjectList"
                      :key="item.id"
                      :title="item.name"
                    >
                      {{ item.name }}
                      <el-icon class="adssa-icon" @click.stop="deleteObject(index)"><Close /></el-icon>
                    </li>
                  </ul>
                </div>
              </template>
            </el-popover>
          </div>
        </div>
      </div>
      <footer>
        <el-button
          type="primary"
          @click="addStrategy"
          :disabled="addService.disabledSure.value || addService.isDisabled.value"
        >
          确认
        </el-button>
        <el-button @click="cancelStrategy">取消</el-button>
      </footer>
    </div>
    <img class="adssa-bg" src="@/assets/img/assessment-department/ad-strategy-bg.svg" alt="strategy" />
    <el-dialog
      title="分摊源选择"
      width="928px"
      :zIndex="1000"
      :close-on-click-modal="false"
      v-model="isShowDialog"
      custom-class="adssa-inner-dialog"
      destroy-on-close
    >
      <share-source
        @cancel="cancelSource"
        @sure="sureSource"
        :sourceInit="addService.sourceInit.value"
        :energyCode="addService.strategyInfo.energyCode"
      ></share-source>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref } from 'vue';
import ShareSource from './components/adssa-share-source/adssa-share-source.vue';
import ShareObject from './components/adssa-share-object/adssa-share-object.vue';
import { AddService } from './adss-add.service';
import { ElInput, ElSelect, ElOption, ElDatePicker, ElPopover, ElButton, ElDialog, ElMessageBox } from 'element-plus';
import { SelectedItem } from './components/adssa-share-object/adssa-share-object-service';
import { SourceItem, sourceType } from './adss-add.api';
import { Close } from '@element-plus/icons-vue';
import message from '@/utils/message';
import { At_ITableItem } from '../adss-table/adss-table.api';
import { formatDate } from '@/utils';
import { onBeforeRouteLeave } from 'vue-router';

const props = defineProps({
  strategyInfoInit: Object as PropType<At_ITableItem | null>,
  titleAction: String,
});
const emit = defineEmits(['toTable']);

onMounted(() => {
  if (props.titleAction !== '查看') {
    window.onbeforeunload = function (e) {
      e.preventDefault();
      return true;
    };
  }
});
onUnmounted(() => {
  window.onbeforeunload = null;
});

onBeforeRouteLeave(async (to, from) => {
  if (props.titleAction !== '查看') {
    try {
      await ElMessageBox.confirm('退出后不保存编辑内容', '确认退出吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
    } catch (error) {
      return false;
    }
  }
});

const addService = new AddService(props.strategyInfoInit, props.titleAction ?? '');
const isShowDialog = ref(false);
const isShowPopover = ref(false);

function toTable() {
  emit('toTable');
}

// 分摊周期
function startDateDisabled(date: Date) {
  return addService.strategyInfo.apportionedEndTime
    ? (date.getTime() > new Date(addService.strategyInfo.apportionedEndTime).getTime() &&
        formatDate(date, 'yyyy-MM-dd') !== addService.strategyInfo.apportionedEndTime) ||
        date.getTime() > new Date().getTime()
    : date.getTime() > new Date().getTime();
}
function endDateDisabled(date: Date) {
  return addService.strategyInfo.apportionedStartTime
    ? date.getTime() < new Date(addService.strategyInfo.apportionedStartTime).getTime() &&
        formatDate(date, 'yyyy-MM-dd') !== addService.strategyInfo.apportionedStartTime
    : false;
}

// 分摊对象
const initObjectItem = ref<string[]>([]);
function cancelObject() {
  isShowPopover.value = false;
}
function sureObject(data: SelectedItem[]) {
  addService.strategyInfo.apportionedObjectList = [];
  data?.forEach((item) => {
    addService.strategyInfo.apportionedObjectList.push({ id: item.id, name: item.name });
  });
  addService.strategyInfo.apportionedObjectType = data?.[0]?.type;
}
function showObject() {
  if (addService.disabledSure.value) {
    return;
  }
  initObjectItem.value = [];
  addService.strategyInfo.apportionedObjectList?.forEach((item) => {
    initObjectItem.value.push(item.id);
  });
}
function deleteObject(index: number) {
  if (addService.disabledSure.value) {
    return;
  }
  addService.strategyInfo.apportionedObjectList.splice(index, 1);
}

// 新增分摊策略
function addStrategy() {
  if (addService.strategyInfo.apportionedName === '') {
    message.warning('策略名称不能为空');
    return;
  }
  if (addService.strategyInfo.apportionedStartTime === '') {
    message.warning('分摊周期开始日期不能为空');
    return;
  }
  if (addService.strategyInfo.apportionedSources.length === 0) {
    message.warning('分摊源不能为空');
    return;
  }
  if (addService.strategyInfo.apportionedRuleId === '') {
    message.warning('分摊规则不能为空');
    return;
  }
  if (addService.strategyInfo.apportionedObjectList.length === 0) {
    message.warning('分摊对象不能为空');
    return;
  }
  console.log(addService.strategyInfo);
  if (addService.actionType.value === '新增') {
    addService.addShareSource().then((res: Boolean | undefined) => {
      if (res) {
        toTable();
      }
    });
  } else {
    addService.updateShareSource().then((res: Boolean | undefined) => {
      if (res) {
        toTable();
      }
    });
  }
}
function cancelStrategy() {
  if (addService.actionType.value === '查看') {
    toTable();
  } else {
    ElMessageBox.confirm('退出后不保存编辑内容', '确认退出吗？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      toTable();
    });
  }
}

// 分摊源
// 用来记录当前点击的是哪个分摊源
let currentSource = -1;
function openSourceDialog() {
  if (addService.disabledSure.value) {
    return;
  }
  isShowDialog.value = true;
  addService.sourceInit.value = {
    apportionedSourceFormula: '',
    apportionedSourceType: addService.strategyInfo.apportionedSources[0]?.apportionedSourceType,
    apportionedSourceVarList: [],
  };
  currentSource = -1;
}
function cancelSource() {
  isShowDialog.value = false;
}
function sureSource(data: SourceItem) {
  // 判断点位是否已经存在
  if (data.apportionedSourceType === sourceType.点位) {
    let isExist = false;
    addService.strategyInfo.apportionedSources?.forEach((item) => {
      if (
        item.apportionedSourceVarList[0].concentratorId === data.apportionedSourceVarList[0].concentratorId &&
        item.apportionedSourceVarList[0].deviceId === data.apportionedSourceVarList[0].deviceId &&
        item.apportionedSourceVarList[0].pointNumber === data.apportionedSourceVarList[0].pointNumber
      ) {
        isExist = true;
      }
    });
    if (isExist) {
      message.warning('分摊源不能存在重复点位');
      return;
    }
  }
  // 如果是-1则说明是新增，不是则为修改
  if (currentSource === -1) {
    if (
      addService.strategyInfo.apportionedSources?.at(-1)?.apportionedSourceType === sourceType.点位 &&
      data.apportionedSourceType === sourceType.变量
    ) {
      message.warning('分摊源不能同时存在点位和变量');
      return;
    }
    if (addService.strategyInfo.apportionedSources?.at(-1)?.apportionedSourceType === sourceType.变量) {
      message.warning('分摊源只能存在一个变量');
      return;
    }
    addService.strategyInfo.apportionedSources.push(data);
  } else {
    addService.strategyInfo.apportionedSources[currentSource] = data;
  }
}
function transSourceName(item: SourceItem) {
  let res = '';
  if (item.apportionedSourceType === sourceType.点位) {
    item.apportionedSourceVarList.forEach((item) => {
      res = `${item.deviceName}：${item.pointNumberName}`;
    });
  } else {
    res = item.apportionedSourceFormula;
    item.apportionedSourceVarList.forEach((item, index) => {
      let re = new RegExp(String.raw`V${index}(?![0-9])`, 'g');
      res = res.replace(re, `${item.deviceName}：${item.pointNumberName}`);
    });
  }
  return res;
}

function toShowSourceInfo(item: SourceItem, index: number) {
  if (addService.disabledSure.value) {
    return;
  }
  isShowDialog.value = true;
  addService.sourceInit.value = item;
  currentSource = index;
}

function deleteSourceVar(index: number) {
  if (addService.disabledSure.value) {
    return;
  }
  addService.strategyInfo.apportionedSources.splice(index, 1);
}

// 能源类型切换
function energyChange() {
  addService.strategyInfo.apportionedSources = [];
}
</script>

<style lang="less" scoped>
.adss-add {
  padding-top: 16px;
  height: 100%;
  position: relative;
  padding-bottom: 58px;
  header {
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    img {
      margin-right: 16px;
      cursor: pointer;
    }
  }
  .adssa-content {
    width: 50%;
    padding-left: 8px;
    .adssa-basic-info {
      margin-bottom: 70px;
    }
    .adssa-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }
    .adssa-form-title {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
    }
    .adssa-share-source {
      min-height: 36px;
      max-height: 96px;
      border: 1px solid rgb(220, 223, 230);
      border-radius: 4px;
      padding: 6px;
      cursor: pointer;
      transition: all 0.3s;
      overflow: auto;
      &:hover {
        border-color: rgb(24, 144, 255);
      }
      ul {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        li {
          width: 92px;
          height: 22px;
          padding: 0 24px 0 8px;
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border-radius: 2px;
          background-color: rgba(0, 0, 0, 0);
          border: 1px solid rgba(217, 217, 217, 1);
          .adssa-icon {
            position: absolute;
            right: 3px;
            top: 3px;
            :deep(.icon) {
              width: 10px;
              height: 10px;
            }
          }
        }
      }
    }
    .adssa-source-tip {
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }
    .adssa-share-source-disabled {
      color: #c0c4cc;
      border-color: #e4e7ed;
      background-color: rgba(0, 0, 0, 0.04);
      cursor: not-allowed;
      &:hover {
        border-color: #e4e7ed;
      }
    }
  }
  .adssa-bg {
    position: absolute;
    right: 48px;
    bottom: 58px;
    max-width: calc(50% - 48px);
  }
  footer {
    margin-top: 50px;
  }
  .adssa-separator {
    display: inline-block;
    width: 4%;
    text-align: center;
  }
  :deep(.adssa-inner-dialog) {
    .el-dialog__body {
      padding: 26px 20px 20px;
    }
  }
  :deep(.el-select) {
    width: 100%;
  }
  :deep(.el-date-editor) {
    width: 48%;
  }
  :deep(.el-range-editor.is-disabled) {
    background-color: rgba(0, 0, 0, 0.04);
    input {
      background: transparent;
    }
  }
  :deep(.sub-title) {
    margin-bottom: 24px;
  }
  :deep(.el-button.is-disabled) {
    background-color: rgba(160, 207, 255, 1) !important;
    border-color: rgba(160, 207, 255, 1) !important;
  }
  :deep(.el-input__prefix) {
    right: 11px;
    left: auto;
    display: flex;
    align-items: center;
  }
}
</style>
<style>
.adssa-popover {
  width: 464px !important;
  padding: 0px !important;
}
</style>
