<template>
  <el-dialog
    v-model="visible"
    title="新增批语"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="640"
    @close="onCancel(formRef)"
  >
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-form-item label="批语" prop="comment">
        <el-input
          v-if="visible"
          v-inputFilter:search="{ allowSpace: false, regularStr: defaultStr }"
          v-model="formData.comment"
          type="textarea"
          :rows="9"
          maxlength="500"
          placeholder="请输入批语内容"
          show-word-limit
        />
      </el-form-item>
      <el-divider></el-divider>
      <el-row type="flex" justify="end">
        <el-button @click="onCancel(formRef)">取消</el-button>
        <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>
<script lang="ts" setup>
// API
import { onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import message from '../../../../../utils/message';

import { CostAccountingQueryPageRequest } from '../../../cost-pre-accounting-deviation.api';
// 服务
import CpAdSearchBarService from '../../cpad-search/cpad-search.service';
import cpadDAddService from './cpad-d-add.service';
import { getTenant } from '@/utils';

const destroy$ = new Subject<void>();

const emits = defineEmits(['search']);

const formRef = ref();
const visible = ref<boolean>(false);
const params = ref<any>();

const defaultStr = String.raw`\`\\;\'\"<>`;

const formData = ref<{ comment: string }>({
  comment: '',
});

const rules = {
  comment: [{ required: true, message: '请输入批语内容', trigger: 'blur' }],
};

const show = () => {
  visible.value = true;
};
defineExpose({ show });

const onCancel = (formRef: any) => {
  if (!formRef) {
    return;
  }
  formRef.resetFields();
  visible.value = false;
};

const onSubmit = (formRef: any) => {
  if (!formRef) return;
  formRef.validate(async (valid: any, fields: any) => {
    if (valid) {
      try {
        const res = await cpadDAddService.addComment({
          comment: formData.value.comment,
          ...getTenant(),
          year: new Date(params.value.startTime).getFullYear(),
          month: new Date(params.value.endTime).getMonth() + 1,
        });
        if (res?.data && res.code === 200) {
          CpAdSearchBarService.search(params.value.startTime, params.value.endTime);
          message.success(res.message ?? '操作成功');
          onCancel(formRef);
        } else {
          onCancel(formRef);
        }
      } catch (error) {
        console.log(error);
        onCancel(formRef);
      }
    } else {
      console.log('新增失败', fields);
    }
  });
};

onMounted(() => {
  CpAdSearchBarService.searchParamsRef$.pipe(takeUntil(destroy$)).subscribe((v) => {
    params.value = v;
  });
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>
<style lang="less" scoped>
.el-dialog {
  :deep(.el-dialog-body) {
    padding: 4px 15px !important;
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
