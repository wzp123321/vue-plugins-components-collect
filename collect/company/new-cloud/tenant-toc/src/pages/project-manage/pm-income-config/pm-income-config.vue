<!--
 * @Author: yut
 * @Date: 2023-10-17 15:30:44
 * @LastEditors: yut
 * @LastEditTime: 2023-12-29 14:16:48
 * @Descripttion: 
-->

<template>
  <div class="pm-income">
    <te-dialog
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @closed="closedDialog"
      width="960"
      :title="title"
    >
      <te-form
        label-width="60px"
        ref="picformRef"
        :model="picService.editData"
        :rules="rules"
        label-position="left"
        v-if="!isView"
      >
        <div
          class="pic-info"
          v-if="!isView && (originType === PM_EDialogType.运维服务费 || originType === PM_EDialogType.设备维保服务费)"
        >
          <icon-info-filled />
          <span>请填写税前收入数据，系统将自动扣税填入预核算表中。</span>
        </div>

        <te-form-item label="托管期" prop="dateTimeList">
          <te-select
            v-model="picService.editData.dateTimeList"
            @change="handlePeriodChange"
            multiple
            clearable
            placeholder="请选择托管期"
          >
            <te-option
              v-for="(item, index) in picService.hostPeriodList"
              :key="'date_' + index"
              :label="item.name"
              :value="item.code"
            ></te-option>
          </te-select>
        </te-form-item>
        <te-form-item label="数值" prop="data">
          <te-input
            v-model="picService.editData.data"
            ref="dataRef"
            v-inputFilter:number="{ integral: 10, decimal: 4 }"
            placeholder="请输入"
          >
            <template #suffix> 元 </template>
          </te-input>
        </te-form-item>
        <te-form-item label="">
          <te-button type="primary" @click="fillIn(picformRef)">填入</te-button>
          <te-button @click="reset(picformRef)">重置</te-button>
        </te-form-item>
      </te-form>
      <div v-loading="picService.loading" class="pic-table-wrap">
        <te-table :data="picService.bodyList" :height="tableHeight" :header-row-class-name="mapHeaderClassName">
          <te-table-column
            :label="picService.headerList[0]"
            :min-width="picService.flexColumnWidth(picService.bodyList, 'periodName')"
            align="left"
            fixed
            show-overflow-tooltip
          >
            <template #default="scope">
              {{ scope.row.periodName ? scope.row.periodName : '-' }}
            </template>
          </te-table-column>
          <te-table-column
            v-for="(item, index) in picService.headerList?.slice(1)"
            align="right"
            :key="item"
            :label="item"
            :min-width="120"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="pic-title-container">
                <te-input
                  v-if="picService.mapIsEditing(scope.row, scope.$index, index)"
                  v-model="scope.row.values[index]"
                  v-inputFilter:number="{ integral: 10, decimal: 4 }"
                  v-auto-focus
                  v-auto-blur
                  @change="changeVal(index, item, scope.row)"
                  @blur="blurEvt(index, scope.row)"
                ></te-input>
                <span v-else>{{ thousandSeparation(scope.row.values[index]) }}</span>
                <span
                  v-if="!picService.mapIsEditing(scope.row, scope.$index, index) && !isView"
                  class="pic-edit"
                  @click="picEdit(scope.row, scope.$index, index)"
                  ><IconEditPen
                /></span>
              </div>
            </template>
          </te-table-column>
        </te-table>
      </div>
    </te-dialog>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, reactive, ref } from 'vue';
import { IconEditPen, IconInfoFilled } from '@arco-iconbox/vue-te';
import {
  TeDialog,
  TeForm,
  TeFormItem,
  TeSelect,
  TeOption,
  TeCheckbox,
  TeCheckboxGroup,
  TeInput,
  TeTable,
  TeTableColumn,
  TeTooltip,
} from '@tiansu/element-plus';
import picService from './pm-income-config.service';
import { getTenant, thousandSeparation } from '@/utils';
import { IPIC_Params, IPIC_Index, EServiceCharge, IPIC_TableRow } from './pm-income-config.api';
import { cloneDeep } from 'lodash';
import store from '@/store';
import { PM_EDialogType } from '../constant/enum';

const tableHeight = computed(() => {
  return picService.bodyList?.length >= 9 ? 486 : (picService.bodyList?.length + 1) * 48 + 6;
});

function mapHeaderClassName({ row, rowIndex }: any) {
  return 'pic-header';
}

//是否处于编辑出错状态

const dialogVisible = ref(false); //是否展示弹窗
const picformRef = ref(); //表单ref
const dataRef = ref(); //数据ref

/**
 * 校验数据
 * @param rule
 * @param value
 * @param callback
 */
const validateData = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入数值'));
  } else {
    callback();
  }
};
const rules = reactive<any>({
  dateTimeList: [{ required: true, message: '请选择托管期', trigger: 'change' }],
  data: [{ required: true, validator: validateData, trigger: 'change' }],
});

const dates = ref<{ startTime: string; endTime: string }[]>([]);

/**
 * 托管周期变更
 * @param value
 */
const handlePeriodChange = (value: number[]) => {
  dates.value = [];
  picService.hostPeriodList?.forEach((item) => {
    if (value.includes(item.code)) {
      dates.value.push({
        startTime: picService.mapTime(item.start.year, item.start.monthOfYear),
        endTime: picService.mapTime(item.end.year, item.end.monthOfYear),
      });
    }
  });
};

const picEdit = (row: IPIC_TableRow, dataIndex: number, typeIndex: number) => {
  picService.picEdit(row, dataIndex, typeIndex);
};

/**
 * 失焦
 */
const blurEvt = (index: number, row: IPIC_TableRow) => {
  if (
    row.values[index] == picService.editParams.origin ||
    (row.values[index] === '' && !picService.editParams.origin)
  ) {
    picService.initParams();
  }
};

/**
 * 值改变
 */
const changeVal = (index: number, key: string, row: IPIC_TableRow) => {
  const val = cloneDeep(row.values[index]);
  if (picService.editParams.origin === val.replace(/[^\d.]/g, '')) {
    return;
  }
  const param = {
    dateTimeList: row.dateList[index]
      ? [
          {
            startTime: row.dateList[index],
            endTime: row.dateList[index],
          },
        ]
      : [],
    value: val === '' ? null : Number(val),
  };
  switch (originType.value) {
    case PM_EDialogType.运维服务费:
    case PM_EDialogType.设备维保服务费:
      updateCostItem(param);
      break;
    case PM_EDialogType.定值指标:
      updateConstantInfo(param);
      break;
    case PM_EDialogType.其他收益:
    case PM_EDialogType.固定收益:
      updateRetainingIncome(param);
      break;
    default:
      break;
  }
};

const costType = ref(''); //服务费类型
const incomeShareType = ref(''); //收益分享类型
const serialNumber = ref(''); //定值指标
const originType = ref<PM_EDialogType>(PM_EDialogType.运维服务费);

const isView = ref(false); //是否查看
const title = ref(''); //弹窗标题

/**
 * 打开弹窗
 * @param type 打开弹窗的枚举类型
 * @param param 入参
 * @param flag 是否是查看
 */
const openDialog = (type: PM_EDialogType, param: number | IPIC_Index, flag = true) => {
  picService.queryScopeList();
  isView.value = flag;
  dialogVisible.value = true;
  picformRef.value?.resetFields();
  originType.value = type;
  switch (type) {
    case PM_EDialogType.运维服务费:
      costType.value = EServiceCharge.运维服务费;
      title.value = flag ? '运维服务费' : '编辑运维服务费';
      picService.queryCostTypeTableData({
        costType: costType.value,
        ...getTenant(),
      });
      break;
    case PM_EDialogType.设备维保服务费:
      costType.value = EServiceCharge.维保服务费;
      title.value = flag ? '设备维保服务费' : '编辑设备维保服务费';
      picService.queryCostTypeTableData({
        costType: costType.value,
        ...getTenant(),
      });
      break;
    case PM_EDialogType.固定收益:
      title.value = flag ? '固定收益' : '编辑固定收益';
      incomeShareType.value = param.toString();
      picService.queryIncomeTable({
        incomeShareType: incomeShareType.value,
        ...getTenant(),
      });
      break;
    case PM_EDialogType.其他收益:
      title.value = flag ? '其他收益' : '编辑其他收益';
      incomeShareType.value = param.toString();
      picService.queryIncomeTable({
        incomeShareType: incomeShareType.value,
        ...getTenant(),
      });
      break;
    case PM_EDialogType.定值指标:
      title.value = flag ? (param as IPIC_Index).indexName : `编辑${(param as IPIC_Index).indexName}`;
      serialNumber.value = (param as IPIC_Index).serialNumber;
      picService.querySerialTable({
        serialNumber: serialNumber.value,
        tenantId: { ...getTenant() }.tenantId,
      });
      break;
    default:
      title.value = flag ? '查看' : '编辑';
      break;
  }
};

/**
 * 关闭弹窗
 */
const closeDialog = () => {
  dialogVisible.value = false;
  picformRef.value?.resetFields();
  initParams();
};

/**
 * 初始化参数
 */
const initParams = () => {
  picService.editData.data = '';
  picService.editData.dateTimeList = [];
  costType.value = '';
  originType.value = PM_EDialogType.运维服务费;
};

/**
 * 弹窗关闭后
 */
const closedDialog = () => {
  picformRef.value?.resetFields();
  initParams();
};

/**
 * 填入表格
 */
const fillIn = (formEl: any) => {
  dataRef.value?.blur();
  nextTick(async () => {
    if (!formEl) return;
    await formEl.validate((valid: any, fields: any) => {
      if (valid) {
        switch (originType.value) {
          case PM_EDialogType.运维服务费:
          case PM_EDialogType.设备维保服务费:
            updateCostItem(getParams());
            break;
          case PM_EDialogType.定值指标:
            updateConstantInfo(getParams());
            break;
          case PM_EDialogType.其他收益:
          case PM_EDialogType.固定收益:
            updateRetainingIncome(getParams());
            break;
          default:
            break;
        }
      }
    });
  });
};

/**
 * 更新服务费
 */
const updateCostItem = (param: IPIC_Params) => {
  picService
    .saveCostItem({
      costType: costType.value,
      ...getTenant(),
      ...param,
    })
    .then(() => {
      picService.queryCostTypeTableData({
        costType: costType.value,
        ...getTenant(),
      });
    });
};

/**
 * 更新定值
 */
const updateConstantInfo = (param: IPIC_Params) => {
  picService
    .saveConstantInfo({
      serialNumber: serialNumber.value,
      tenantId: { ...getTenant() }.tenantId,
      ...param,
    })
    .then(() => {
      picService.querySerialTable({
        serialNumber: serialNumber.value,
        tenantId: { ...getTenant() }.tenantId,
      });
    });
};
/**
 * 更新收益
 */
const updateRetainingIncome = (param: IPIC_Params) => {
  picService
    .saveRetainingIncome({
      incomeShareType: incomeShareType.value,
      tenantId: { ...getTenant() }.tenantId,
      ...param,
    })
    .then(() => {
      picService.queryIncomeTable({
        incomeShareType: incomeShareType.value,
        tenantId: { ...getTenant() }.tenantId,
      });
    });
};

/**
 * 获取传入接口参数
 */
const getParams = () => {
  return {
    dateTimeList: dates.value,
    value: Number(picService.editData.data),
  };
};

/**
 * 重置
 * @param formEl
 */
const reset = (formEl: any) => {
  if (!formEl) return;
  formEl.resetFields();
};

// 对外暴露的方法
defineExpose({
  closeDialog,
  openDialog,
});
</script>
<style lang="less" scoped>
.pm-income {
  :deep(.is-right) {
    text-align: right !important;
  }
  :deep(.is-left) {
    text-align: left !important;
  }
  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter);
    border-right: 1px solid var(--te-border-color-lighter);
  }

  .te-select {
    width: 100%;
  }
  .te-form-item__content .te-input {
    width: 120px;
  }
  .te-checkbox-group {
    margin-left: 24px;

    .te-checkbox {
      margin-right: 24px;
    }
  }
  :deep(tr td > .cell .pic-edit) {
    display: none;
  }
  :deep(tr td > .cell) {
    position: relative;
    &:hover .pic-edit {
      cursor: pointer;
      margin-left: var(--te-space-8);
      width: 16px;
      height: 16px;
      flex: none;
      display: inline-block;
    }
  }
  .pic-offscale .pic-edit {
    display: none !important;
  }
  .pic-title-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .pic-info {
    margin-bottom: 16px;
    padding: var(--te-space-8) var(--te-space-16);
    display: flex;
    align-items: center;
    gap: var(--te-space-8);
    background-color: var(--te-color-info-light-9);
    border-radius: var(--te-space-4);
    color: var(--te-color-info);
  }

  .pic-table-wrap {
    min-height: 300px;
  }

  :deep(.te-tag__content) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.pic-error .te-input__wrapper) {
    box-shadow: 0 0 0 1px var(--te-color-danger) inset;
  }
  :deep(table > tbody > tr:nth-child(even) > td) {
    background-color: var(--color-table-body);
  }
  :deep(.pic-header .is-right) {
    text-align: center !important;
  }
  :deep(.te-select-tags-wrapper) {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
