<!--
 * @Author: yut
 * @Date: 2023-07-28 14:18:51
 * @LastEditors: yut
 * @LastEditTime: 2023-08-30 13:30:16
 * @Descripttion: 
-->
<template>
  <te-dialog
    class="er-operate-modal"
    v-model="energyRateService.visible"
    :title="energyRateService.editType === EEditType.新增 ? '新增模板' : '修改模板'"
    width="540px"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    @opened="opendModal"
    @closed="closedModal"
  >
    <te-form
      ref="ruleFormRef"
      :model="energyRateService.editData"
      class="eom-edit-form"
      :rules="rules"
      label-width="120px"
    >
      <te-form-item label="能源类型" prop="energyCode">
        <te-select
          v-model="energyRateService.editData.energyCode"
          :disabled="energyRateService.editType === EEditType.修改"
          @change="energyTypeChange"
        >
          <te-option
            v-for="item in energyRateService.energyTypeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          >
          </te-option>
        </te-select>
      </te-form-item>
      <te-form-item label="模板类型" prop="templateType">
        <te-select
          v-model="energyRateService.editData.templateType"
          :disabled="energyRateService.editData.energyCode !== EEnergyType.电"
        >
          <te-option
            v-for="item in energyRateService.templateTypeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          >
          </te-option>
        </te-select>
      </te-form-item>
      <te-form-item label="生效时间/开始" prop="effectiveTime">
        <te-date-picker
          style="width: 100%"
          :disabled-date="disabledDate"
          v-model="energyRateService.editData.effectiveTime"
          popper-class="rate-datepopper"
          type="date"
          placeholder="请选择日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          :teleported="false"
          clearable
        >
        </te-date-picker>
      </te-form-item>
      <te-form-item label="生效时间/结束" prop="expirationTime">
        <te-date-picker
          style="width: 100%"
          :disabled-date="disabledDate2"
          v-model="energyRateService.editData.expirationTime"
          popper-class="rate-datepopper"
          type="date"
          placeholder="请选择日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          :teleported="false"
          clearable
        ></te-date-picker>
      </te-form-item>
      <te-form-item
        class="eom-money-item"
        label="费率"
        prop="parity"
        v-if="energyRateService.editData.templateType === ETemplateType.平价模板"
      >
        <te-input
          v-model="energyRateService.editData.parity"
          v-inputFilter:number="{ integral: 6, decimal: 4 }"
          placeholder="请输入数值"
        />
        <span>元</span>
      </te-form-item>
      <te-form-item
        class="eom-money-item"
        label="尖"
        prop="sharp"
        v-if="energyRateService.editData.templateType === ETemplateType.分时模板"
      >
        <te-input
          v-model="energyRateService.editData.sharp"
          v-inputFilter:number="{ integral: 6, decimal: 4 }"
          placeholder="请输入数值"
        />
        <span>元</span>
      </te-form-item>
      <te-form-item
        class="eom-money-item"
        label="峰"
        prop="peak"
        v-if="energyRateService.editData.templateType === ETemplateType.分时模板"
      >
        <te-input
          v-model="energyRateService.editData.peak"
          v-inputFilter:number="{ integral: 6, decimal: 4 }"
          placeholder="请输入数值"
        />
        <span>元</span>
      </te-form-item>
      <te-form-item
        class="eom-money-item"
        label="平"
        prop="flat"
        v-if="energyRateService.editData.templateType === ETemplateType.分时模板"
      >
        <te-input
          v-model="energyRateService.editData.flat"
          v-inputFilter:number="{ integral: 6, decimal: 4 }"
          placeholder="请输入数值"
        />
        <span>元</span>
      </te-form-item>
      <te-form-item
        class="eom-money-item"
        label="谷"
        prop="valley"
        v-if="energyRateService.editData.templateType === ETemplateType.分时模板"
      >
        <te-input
          v-model="energyRateService.editData.valley"
          v-inputFilter:number="{ integral: 6, decimal: 4 }"
          placeholder="请输入数值"
        />
        <span>元</span>
      </te-form-item>
    </te-form>
    <template #footer>
      <span class="dialog-footer">
        <te-button @click="reset">重置</te-button>
        <te-button type="primary" @click="submit(ruleFormRef)" :loading="energyRateService.btnLoading">{{
          energyRateService.btnLoading ? '提交中' : '提交'
        }}</te-button>
      </span>
    </template>
  </te-dialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash';
import energyRateService from '../energy-rate.service';
import { computed, reactive, ref } from 'vue';
import { ETemplateType, EEnergyType, EEditType, ER_ITemplateEditData } from '../energy-rate.api';
import message from '../../../utils/message';
const ruleFormRef = ref();
const rules = reactive<any>({
  energyCode: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  effectiveTime: [{ required: true, message: '请输入生效开始时间', trigger: 'blur' }],
  parity: [{ required: true, message: '请填写费率', trigger: 'blur' }],
});

const energyTypeChange = (val: EEnergyType) => {
  if (val !== EEnergyType.电) {
    energyRateService.editData.templateType = ETemplateType.平价模板;
  }
};

/**
 * 限制开始时间
 * @param date
 */
const disabledDate = (date: Date) => {
  return date.getTime() > Date.now();
};

/**
 * 限制结束时间
 * @param date
 */
const disabledDate2 = (date: Date) => {
  return date.getTime() < new Date(energyRateService.editData.effectiveTime!).getTime() - 1 * 24 * 60 * 60 * 1000;
};

/**
 * 重置
 */
const reset = () => {
  energyRateService.editData = cloneDeep(resetData.value!);
};

/**
 * 提交
 * @param formEl
 */
const submit = async (formEl: any) => {
  if (!formEl) return;
  await formEl.validate((valid: any, fields: any) => {
    if (valid) {
      energyRateService.editData.expirationTime = energyRateService.editData.expirationTime ?? null;
      energyRateService.editData.sharp =
        energyRateService.editData.templateType === ETemplateType.平价模板 ? null : energyRateService.editData.sharp;
      energyRateService.editData.peak =
        energyRateService.editData.templateType === ETemplateType.平价模板 ? null : energyRateService.editData.peak;
      energyRateService.editData.flat =
        energyRateService.editData.templateType === ETemplateType.平价模板 ? null : energyRateService.editData.flat;
      energyRateService.editData.valley =
        energyRateService.editData.templateType === ETemplateType.平价模板 ? null : energyRateService.editData.valley;
      energyRateService.editData.parity =
        energyRateService.editData.templateType === ETemplateType.分时模板 ? null : energyRateService.editData.parity;

      if (
        energyRateService.editData.expirationTime &&
        new Date(energyRateService.editData.effectiveTime!) > new Date(energyRateService.editData.expirationTime)
      ) {
        message.error('生效结束时间不可小于开始时间！');
        return;
      }
      //分时费率时至少配置一项
      if (
        energyRateService.editData.templateType === ETemplateType.分时模板 &&
        !energyRateService.editData.sharp &&
        !energyRateService.editData.peak &&
        !energyRateService.editData.flat &&
        !energyRateService.editData.valley
      ) {
        message.error('请至少配置一项分时费率！');
        return;
      }
      //分时时，分时至少填一项，不能为0
      if (
        energyRateService.editData.templateType === ETemplateType.分时模板 &&
        (validZero(energyRateService.editData.sharp) || !energyRateService.editData.sharp) &&
        (validZero(energyRateService.editData.peak) || !energyRateService.editData.peak) &&
        (validZero(energyRateService.editData.flat) || !energyRateService.editData.flat) &&
        (validZero(energyRateService.editData.valley) || !energyRateService.editData.valley)
      ) {
        message.error('分时至少填一项！');
        return;
      }
      //平价模板时，费率不能为0
      if (validZero(energyRateService.editData.parity)) {
        message.error('费率不能为0！');
        return;
      }
      switch (energyRateService.editType) {
        case EEditType.新增:
          energyRateService.addRateTempale();
          break;
        case EEditType.修改:
          energyRateService.editRateTemplate();
          break;
      }
    }
  });
};

/**
 * 验证是否为'0'
 * @param val
 */
const validZero = (val: string | number | null) => {
  return val == '0' || val == '0.0' || val == '0.00' || val == '0.000' || val == '0.0000';
};

/**
 * 关闭弹窗后
 */
const closedModal = () => {
  ruleFormRef.value?.resetFields();
};

const resetData = ref<ER_ITemplateEditData>();
/**
 * 打开弹窗后
 */
const opendModal = () => {
  resetData.value = cloneDeep(energyRateService.editData);
};
</script>
<style lang="less" scoped>
.eom-edit-form {
  .te-select,
  .te-input {
    width: 100% !important;
  }
}
.eom-money-item {
  .te-form-item__content {
    display: flex;
    align-items: center;
    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
      width: 24px;
    }
  }
  .te-input {
    flex: auto;
    width: auto !important;
  }
}
</style>
<style lang="less">
.er-operate-modal {
  .te-dialog__header {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 12px 20px;
    background-color: var(--color-table-header);
    border: none;
    border-radius: 3px 3px 0 0;
    margin-right: 0;
  }
  .te-dialog__headerbtn {
    width: 48px;
    height: 48px;
    top: 0;
  }
  .te-dialog__title {
    line-height: 24px;
    font-size: 14px !important;
    font-weight: 400 !important;
    color: var(--color-primary);
  }
  .te-dialog__body {
    padding-bottom: 10px;
  }
  .te-dialog__footer {
    padding-top: 20px !important;
    border-top: 1px solid var(--color-text-border) !important;
  }
}
</style>
