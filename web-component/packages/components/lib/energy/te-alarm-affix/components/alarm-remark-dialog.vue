<!--
 * 单条确认备注弹框:必填 + 50 字符上限 + 3 行 + 不允许空格
 * saving 时禁用全部关闭路径
-->
<template>
  <te-dialog
    :model-value="modelValue"
    width="480px"
    title="备注"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!saving"
    :destroy-on-close="true"
    :append-to-body="true"
    @update:model-value="handleModelValueChange"
  >
    <te-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="alarm-remark-dialog-form"
      @submit.prevent
    >
      <te-form-item prop="remark" label="备注">
        <te-input
          :model-value="form.remark"
          @update:model-value="handleRemarkInput"
          type="textarea"
          placeholder="请输入"
          :maxlength="50"
          resize="none"
          :show-word-limit="true"
          :rows="3"
          :autofocus="true"
        />
      </te-form-item>
    </te-form>
    <template #footer>
      <te-button :disabled="saving" @click="handleCancel">取消</te-button>
      <te-button
        type="primary"
        :loading="saving"
        :disabled="saving"
        @click="handleConfirm"
      >
        确定
      </te-button>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  TeDialog,
  TeMessage,
  TeForm,
  TeFormItem,
  TeInput,
  TeButton,
} from '@tiansu/element-plus';
import { filterText } from '../utils';

defineOptions({ name: 'TeAlarmRemarkDialog' });

const props = defineProps<{
  modelValue: boolean;
  /** 父级控制"确定"按钮 loading;为 true 时禁用全部关闭路径 */
  saving?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'confirm', remark: string): void;
  (event: 'cancel'): void;
}>();

const formRef = ref<InstanceType<typeof TeForm>>();
const form = ref({ remark: '' });

const rules = {
  remark: [{ required: true, message: '请输入告警备注', trigger: 'blur' }],
};

/** 打开时重置,避免上次输入残留 */
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value.remark = '';
      // 下一帧清校验,确保表单已挂载
      requestAnimationFrame(() => formRef.value?.clearValidate?.());
    }
  },
);

const handleModelValueChange = (val: boolean) => {
  if (props.saving && !val) return; // saving 中不允许关闭
  emit('update:modelValue', val);
  if (!val) {
    emit('cancel');
  }
};

/** 备注输入:过滤特殊字符 + 空格 */
const handleRemarkInput = (val: string) => {
  form.value.remark = filterText(val, { allowSpace: false });
};

const handleCancel = () => {
  if (props.saving) {
    return;
  }
  emit('update:modelValue', false);
  emit('cancel');
};

const handleConfirm = async () => {
  if (props.saving || !formRef.value) {
    return;
  }
  try {
    formRef.value.validate().then((res: boolean) => {
      if (res) {
        emit('confirm', form.value.remark);
      }
    });
  } catch {
    TeMessage.error('请输入告警备注');
  }
};
</script>

<style lang="less" scoped>
.alarm-remark-dialog-form {
  padding-right: 8px;
}
</style>
