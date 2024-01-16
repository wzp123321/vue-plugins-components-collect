<template>
  <div class="esm-add">
    <el-dialog
      v-model="visible"
      title="新增节能量管理"
      :width="480"
      :close-on-click-modal="false"
      custom-class="esm-add"
      @close="onCancel(formRef)"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="76px">
        <el-form-item label="托管期" prop="code">
          <el-select v-model="formData.code" style="width: 328px" @change="getMoreParams(formData.code)">
            <el-option v-for="(item, index) in periodList" :key="index" :value="item.index" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="节能类型" prop="measureType">
          <el-radio-group v-model="formData.measureType">
            <el-radio-button :label="ESM_MeasureCode.技术节能">技术节能</el-radio-button>>
            <el-radio-button :label="ESM_MeasureCode.管理节能">管理节能</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="esm-add-energy" label="能源类型" prop="energyCode">
          <el-radio-group v-model="formData.energyCode">
            <el-radio v-for="(item, index) in energyTypeList" :key="index" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="措施名称" prop="measureName">
          <el-input
            v-model="formData.measureName"
            v-inputFilter:search="{ allowSpace: false }"
            maxlength="20"
            style="width: 328px"
            placeholder="请输入管理措施名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-if="visible"
            v-inputFilter:search="{ allowSpace: false }"
            v-model="formData.remarks"
            type="textarea"
            :rows="2"
            show-word-limit
            maxlength="200"
            style="width: 328px"
            placeholder="请输入备注内容"
          ></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-row type="flex" justify="end">
          <el-button @click="onCancel(formRef)">取消</el-button>
          <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// 服务
import EsmAddService from './esm-add.service';
import searchbarService, { Esm_IHostPeriodVO } from '../esm-table/esm-searchbar.service';
// API
import { ESM_MeasureCode, ESM_EnergyCode, ESM_EnergyCodeVO } from '../../energy-saving-management.api';
import { formatDate, getTenant } from '@/utils';
import message from '@/utils/message';

const destroy$ = new Subject<void>();
const emits = defineEmits(['search']);
const props = defineProps(['savingType']);
const savingType = computed(() => {
  return props.savingType;
});
const visible = ref<boolean>(false);

const formRef = ref();

const energyTypeList = ref<ESM_EnergyCodeVO[]>([]);
const periodList = ref<Esm_IHostPeriodVO[]>([]);
const formData = ref<any>({
  code: '',
  name: '',
  startTime: '',
  endTime: '',
  measureType: ESM_MeasureCode.技术节能,
  energyCode: '',
  measureName: '',
  remarks: '',
});

const rules = ref<any>({
  code: [{ required: true, message: '请选择托管周期', trigger: 'change' }],
  measureType: [{ required: true, message: '请选择节能类型', trigger: 'change' }],
  energyCode: [{ required: true, message: '请选择能源类型', trigger: 'change' }],
  measureName: [
    { required: true, message: '请输入管理措施名称', trigger: 'blur' },
    { min: 0, max: 20, message: '管理措施名称长度不大于20字', trigger: 'blur' },
  ],
});

const show = () => {
  visible.value = true;
  formData.value.code = searchbarService.code;
  formData.value.measureType = props.savingType;
};
defineExpose({ show });

// 记录上一次托管期选择
const memory = ref<number | null | undefined>();
const onCancel = (formRef: any) => {
  if (!formRef) {
    return;
  }
  memory.value = formData.value.code;
  setTimeout(() => {
    formRef.resetFields();
  }, 200);
  visible.value = false;
};

const onSubmit = (formRef: any) => {
  if (!formRef) return;
  formRef.validate(async (valid: any, fields: any) => {
    if (valid) {
      try {
        const res = await EsmAddService.queryTableData({
          index: formData.value.code,
          savingType: formData.value.measureType,
          energyCode: formData.value.energyCode,
          measureName: formData.value.measureName,
          startTime: formData.value.startTime,
          endTime: formData.value.endTime,
          remarks: formData.value.remarks,
          ...getTenant(),
        });
        if (res.data && res.code === 200) {
          message.success('操作成功');
          emits('search');
          onCancel(formRef);
        } else {
          message.error(`操作失败，${res?.message}`);
        }
      } catch (error) {
        message.error('操作失败');
      }
    } else {
      console.log('新增失败', fields);
    }
  });
};
/**
 * 根据托管期处理开始结束时间
 * @param index
 */
const getMoreParams = (index: number) => {
  periodList.value.forEach((item) => {
    if (item.index === index) {
      const startDate = new Date();
      startDate.setFullYear(item.start.year);
      startDate.setMonth(item.start.monthOfYear - 1);
      const endDate = new Date();
      endDate.setFullYear(item.end.year);
      endDate.setMonth(item.end.monthOfYear - 1);
      formData.value.name = item.name;
      formData.value.startTime = formatDate(startDate, 'yyyy-MM');
      formData.value.endTime = formatDate(endDate, 'yyyy-MM');
    }
  });
};

const queryEnergyType = async () => {
  try {
    const res = await EsmAddService.queryEnergyType({ ...getTenant() });
    if (res.data && res.code === 200) {
      energyTypeList.value = res.data;
      res.data.forEach((item) => {
        if (item.code === ESM_EnergyCode.电) {
          formData.value.energyCode = item.code;
        } else {
          formData.value.energyCode = res.data[0].code;
        }
      });
    } else {
      energyTypeList.value = [];
    }
  } catch (error) {
    energyTypeList.value = [];
  }
};

onMounted(async () => {
  searchbarService.periodList$.pipe(takeUntil(destroy$)).subscribe((v) => {
    if (v.length) {
      periodList.value = v;
      formData.value.name = v[0].name;
      formData.value.startTime = v[0].start.year + '-' + v[0].start.monthOfYear;
      formData.value.endTime = v[0].end.year + '-' + v[0].end.monthOfYear;
    }
  });
  searchbarService.searchParams$.pipe(takeUntil(destroy$)).subscribe((v) => {
    formData.value.code = v.index;
    memory.value = v.index;

    getMoreParams(v.index as number);
  });
  await queryEnergyType();
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>

<style lang="less" scoped>
:deep(.esm-add) {
  .el-radio-group {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: var(--el-color-primary) !important;
      background-color: var(--el-color-white) !important;
      border-color: var(--el-color-primary) !important;
    }

    :deep(.el-radio-button:first-child .el-radio-button__inner) {
      width: 164px;
      border-left: no-set;
    }

    :deep(.el-radio-button:last-child .el-radio-button__inner) {
      width: 164px;
    }

    :deep(.el-radio-button__inner) {
      height: 36px;
      padding: 10px 20px;
    }
  }
  .el-form > .el-form-item .el-textarea > .el-textarea__inner {
    padding-left: 11px;
    padding-right: 11px;

    &::placeholder {
      color: var(--color-text-disable);
      border-color: var(--color-text-disable);
    }
  }
  :deep(.el-dialog-body) {
    padding: 4px 15px !important;
  }

  // 能源类型换行
  .esm-add-energy {
    .el-radio-group {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .el-divider--horizontal {
    margin: 8px 0px;
  }
}
</style>

<style lang="less">
.el-dialog {
  .el-dialog__header {
    padding: 12px 20px;
  }

  &__body {
    margin-top: 10px;
    padding: 10px 20px 10px 30px;
  }
}
</style>
