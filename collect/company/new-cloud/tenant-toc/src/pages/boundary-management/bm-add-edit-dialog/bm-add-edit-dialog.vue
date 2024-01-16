<template>
  <div class="bm-add-edit-dialog" id="bm-add-edit-dialog">
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="addEditDialogService.visible"
      :title="addEditDialogService?.addEditForm?.eventId ? '编辑边界' : '新增边界'"
      width="480px"
      :before-close="close"
    >
      <div class="bm-aed-form-container" v-loading="addEditDialogService.loading">
        <el-form
          ref="formRef"
          :rules="rules"
          :model="addEditDialogService.addEditForm"
          label-width="72px"
          status-icon
          @submit.native.prevent
        >
          <!-- 托管期 -->
          <el-form-item label="托管期" prop="hostingPeriod" v-if="!addEditDialogService?.addEditForm?.eventId">
            <el-select
              placeholder="请选择托管期"
              :fit-input-width="true"
              v-model="addEditDialogService.addEditForm.hostingPeriod"
            >
              <el-option
                v-for="(item, index) in cHostPeriodList"
                :key="'date_' + index"
                :title="item.name"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 边界类型 -->
          <el-form-item label="边界类型" prop="boundaryType">
            <el-select
              :disabled="!!addEditDialogService?.addEditForm?.eventId"
              placeholder="请选择边界类型"
              :fit-input-width="true"
              v-model="addEditDialogService.addEditForm.boundaryType"
              @change="addEditDialogService.handleBoundaryTypeChange"
            >
              <el-option
                v-for="(item, index) in addEditDialogService.boundaryTypeList"
                :key="'date_' + index"
                :title="item.name"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 设备类型 -->
          <el-form-item v-if="addEditDialogService.mapDeviceTypeItemShow()" label="设备类型" prop="deviceType">
            <el-select
              :disabled="!!addEditDialogService?.addEditForm?.eventId"
              placeholder="请选择设备类型"
              :fit-input-width="true"
              v-model="addEditDialogService.addEditForm.deviceType"
            >
              <el-option
                v-for="(item, index) in addEditDialogService.deviceTypeList"
                :key="'date_' + index"
                :title="item.name"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 事件名称 -->
          <el-form-item label="事件名称" prop="eventName">
            <input
              class="bm-aed-event-name-input"
              :maxlength="50"
              name="event-name"
              autocomplete="off"
              :validate-event="false"
              placeholder="请输入"
              v-model="addEditDialogService.addEditForm.eventName"
              v-inputFilter:search="{ allowSpace: false }"
              @change="validateEventName"
            />
          </el-form-item>
          <!-- 核定状态 -->
          <el-form-item label="核定状态" prop="verificationType">
            <el-radio-group v-model="addEditDialogService.addEditForm.verificationType">
              <el-radio
                v-for="(item, index) in verificationTypeList"
                :key="'verification_' + index"
                :title="item.name"
                :label="item.code"
                :value="item.code"
              >
                {{ item.name }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 计量类型 -->
          <el-form-item label="计量类型" prop="measureType">
            <el-radio-group v-model="addEditDialogService.addEditForm.measureType">
              <el-radio
                v-for="(item, index) in measureTypeList"
                :key="'verification_' + index"
                :title="item.name"
                :label="item.code"
                :value="item.code"
              >
                {{ item.name }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 能源类型 -->
          <el-form-item label="能源类型" prop="energyCodeAreas">
            <div class="bm-aed-checkbox-group">
              <div
                class="checkbox-item"
                v-for="(item, index) in addEditDialogService.addEditForm.energyCodeAreas"
                :key="'energy-area_' + index"
              >
                <el-checkbox
                  :label="item.energyCodeName"
                  v-model="item.energySelected"
                  @change="onEnergyChange($event, item.energyCode)"
                />
                <el-select
                  placeholder="请选择所属区域"
                  :multiple="true"
                  v-if="item.hasHostingRegion && item?.hostingAreas?.length && item.energySelected"
                  :fit-input-width="true"
                  v-model="item.hostingAreaIds"
                  :class="{ 'not-empty': item.hostingAreaIds?.length > 0 }"
                  @change="onAreaChange"
                >
                  <el-option
                    v-for="(cItem, cIndex) in item?.hostingAreas"
                    :key="'date_' + cIndex"
                    :title="cItem.regionName"
                    :label="cItem.regionName"
                    :value="cItem.id"
                  ></el-option>
                </el-select>
              </div>
            </div>
          </el-form-item>
          <!-- 备注 -->
          <el-form-item label="备注">
            <el-input
              v-model="addEditDialogService.addEditForm.comment"
              v-inputFilter:search="{ allowSpace: false }"
              :rows="4"
              show-word-limit
              type="textarea"
              placeholder="请输入备注内容"
              :maxlength="200"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="bm-aed-footer">
          <button @click="close">取消</button>
          <button primary @click="submit">确定</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, ref } from 'vue';
import bmDataService from '../boundary-management.service';
import addEditDialogService from './bm-add-edit-dialog.service';
import { Common_IObject, CommonICodeName } from '@/service/api';
import { mapMeasureTypeList, mapVerificationTypeList, BmSbIHostPeriodVO } from '../bm-search-bar/bm-search-bar.api';
import { BM_IConvertEnergyAreaVO } from './bm-add-edit-dialog.api';
import { BM_BOUNDARY_EVENT_SESSION_KEY } from '../bm-collapse-home/bm-collapse-home.api';

const props = defineProps({
  hostPeriodList: {
    type: Array as PropType<BmSbIHostPeriodVO[]>,
    default: [],
  },
});
const formRef = ref();
const cHostPeriodList = computed(() => {
  return props.hostPeriodList;
});
// 计量类型列表
const measureTypeList = computed<CommonICodeName<string>[]>(() => {
  return mapMeasureTypeList();
});
// 核定类型列表
const verificationTypeList = computed<CommonICodeName<string>[]>(() => {
  return mapVerificationTypeList();
});
// 校验能源类型
const validateEnergyArea = (
  rule: Common_IObject,
  value: BM_IConvertEnergyAreaVO[],
  callback: (error?: Error) => void,
) => {
  if (!value || value?.length === 0 || value?.every((item) => !item.energySelected)) {
    callback(new Error('请选择能源类型'));
  } else {
    if (
      value?.some((it) => it?.energySelected && it?.hasHostingRegion && it?.hostingAreaIds?.length === 0) ||
      value?.every((it) => !it?.energySelected)
    ) {
      callback(new Error('请选择托管区域'));
    } else {
      callback();
    }
  }
};
const onEnergyChange = (value: boolean, energy: string) => {
  if (formRef.value) {
    formRef.value.clearValidate('energyCodeAreas');
  }
  addEditDialogService.handleEnergyChange(value, energy);
};
const onAreaChange = () => {
  if (formRef.value) {
    formRef.value.clearValidate('energyCodeAreas');
  }
};
/**
 * 校验事件名
 */
const validateEventName = () => {
  if (formRef.value) {
    formRef.value?.validateField('eventName');
  }
};
// 校验规则
const rules = {
  hostingPeriod: {
    required: true,
    message: '请选择托管期',
    trigger: 'change',
  },
  boundaryType: {
    required: true,
    message: '请选择边界类型',
    trigger: 'change',
  },
  deviceType: {
    required: true,
    message: '请选择设备类型',
    trigger: 'change',
  },
  eventName: {
    required: true,
    message: '请输入事件名称',
    trigger: 'change',
  },
  verificationType: {
    required: true,
    message: '请选择核定状态',
    trigger: 'change',
  },
  measureType: {
    required: true,
    message: '请选择计量类型',
    trigger: 'change',
  },
  energyCodeAreas: [{ required: true, validator: validateEnergyArea, trigger: 'blur' }],
};
/**
 * 表单提交
 */
const submit = () => {
  if (!formRef.value) {
    return;
  }
  if (formRef.value) {
    formRef.value.clearValidate();
  }

  formRef.value.validate(async (valid: boolean, fields: Error) => {
    if (valid) {
      const { energyCodeAreas } = addEditDialogService.addEditForm;
      if (formRef.value) {
        formRef.value.validateField('energyCodeAreas');
      }
      if (await addEditDialogService.handleSubmit()) {
        if (formRef.value) {
          formRef.value.resetFields();
        }
        window.sessionStorage.removeItem(BM_BOUNDARY_EVENT_SESSION_KEY);
        bmDataService.query();
      }
    }
  });
};
/**
 * 弹框关闭
 */
const close = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  addEditDialogService.handleClose();
};
</script>
<style lang="less" scoped>
#bm-add-edit-dialog {
  :deep(.el-dialog) {
    .el-dialog__body {
      margin-top: 20px !important;
      padding: 0 35px !important;

      .el-select,
      input {
        width: 100%;
      }

      .bm-aed-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .checkbox-item {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }
      }

      > .bm-aed-form-container > .el-form > .el-form-item {
        margin-bottom: 20px !important;

        &.is-error .el-select.not-empty .el-input__inner {
          border-color: var(--color-text-border);
        }

        .el-form-item__label {
          height: 36px;
          line-height: 36px;
        }

        .el-form-item__content {
          line-height: 1;
        }

        .el-checkbox,
        .el-radio {
          height: 36px;
        }

        .el-input > .el-input__inner {
          line-height: 36px;
        }

        .el-textarea > .el-textarea__inner {
          padding-left: 11px;
          padding-right: 11px;

          &::placeholder {
            color: var(--color-text-disable);
            border-color: var(--color-text-disable);
          }
        }
      }

      > .bm-aed-form-container > .el-form > .el-form-item.is-error.is-required > .el-form-item__content > input {
        border-color: var(--color-danger);
      }

      > .bm-aed-form-container > .el-form > .el-form-item > .el-form-item__content .el-select > .select-trigger {
        > .el-input > .el-input__inner {
          padding-right: 33px !important;
        }

        > .el-select__tags {
          height: 100%;
          padding: 4px 0;
          max-width: 100% !important;

          .el-icon {
            width: 14px;
            height: 14px;
          }

          .el-icon.el-tag__close {
            margin-top: 0;

            svg {
              margin: 1px;
            }
          }

          > span {
            flex-wrap: wrap;
            display: flex;
            overflow-y: auto;
            height: 100%;
            width: 100%;
          }
        }
      }

      > .bm-aed-form-container
        > .el-form
        > .el-form-item
        > .el-form-item__content
        > .el-input.bm-aed-event-name-input
        > .el-input__suffix {
        display: none;
      }
    }

    .el-dialog__footer {
      padding: 10px 20px 10px 0;

      .bm-aed-footer {
        text-align: right;
      }
    }
  }
}
</style>
