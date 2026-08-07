<template>
  <view class="tdf-container">
    <view class="form-content">
      <tsm-form ref="formRef" :model="formData" :rules="rules" scrollToFirstError="smooth" :readonly="readonly">
        <template v-for="item in dsl" :key="item._fc_id">
          <tsm-form-item :label="item.title" :name="item.field">
            <template v-if="item.type === 'select'">
              <view class="picker-trigger" @click="item.visiable = true && !readonly">
                <text class="picker-value">{{
                  getLabelByValue(formData[item.field], item.options ?? []) || '请选择城市'
                }}</text>
                <icon-right class="picker-arrow" :size="16" />
              </view>
            </template>
            <component
              :is="componentsMap[item._fc_drag_tag]"
              v-model:value="formData[item.field]"
              v-model="formData[item.field]"
              :="item.props"
              v-model:show="item.visiable"
              :options="item.options"
              :title="`选择${item.title}`"
            >
              <template v-if="item._fc_drag_tag === 'radio'">
                <tsm-radio v-for="r in item.options" :value="r.value">{{ r.label }}</tsm-radio>
              </template>
              <template v-if="item._fc_drag_tag === 'checkbox'">
                <tsm-checkbox v-for="r in item.options" :value="r.value" :label="r.label"></tsm-checkbox>
              </template>
            </component>
          </tsm-form-item>
        </template>
      </tsm-form>
    </view>
    <view class="bottom-actions">
      <tsm-button theme="primary" size="s" @click="handleSubmit">提交验证</tsm-button>
      <tsm-button theme="default" size="s" style="margin: 0 20px" @click="handleReset">重置</tsm-button>
      <tsm-button theme="default" size="s" @click="handleClearValidate">清除验证</tsm-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Component } from 'vue';
import type { PickerOption } from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-picker/uniapp/props';
import TsmInput from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-input/uniapp/tsm-input.vue';
import TsmTextarea from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-textarea/uniapp/tsm-textarea.vue';
import TsmRadio from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-radio/uniapp/tsm-radio.vue';
import type { FormRule, Trigger } from '@/uni_modules/@tiansu/ts-mobile-ui/libs/uniapp/validators/types';
import type { FormRules } from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-form/uniapp/types';
import TsmRadioGroup from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-radio-group/uniapp/tsm-radio-group.vue';
import tsmCheckboxGroup from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-checkbox-group/uniapp/tsm-checkbox-group.vue';
import TsmRate from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-rate/uniapp/tsm-rate.vue';
import TsmPicker from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-picker/uniapp/tsm-picker.vue';
import type { TdfRenderProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<TdfRenderProps>(), defaultProps);
const emit = defineEmits<{
  submit: [value: Record<string, any>];
  'update:modelValue': [value: Record<string, any>];
}>();
const defaultRules: string[] = ['email', 'phone'];
const formRef = ref();
const dsl = ref(props.data);
const formData = ref<Record<string, any>>(props.modelValue);
const componentsMap: Record<string, Component> = {
  input: TsmInput,
  textarea: TsmTextarea,
  radio: TsmRadioGroup,
  checkbox: tsmCheckboxGroup,
  rate: TsmRate,
  select: TsmPicker,
};
const rules = ref<FormRules>({});
// 初始化渲染数据+规则数据
const initRenderRules = () => {
  dsl.value.forEach(item => {
    const fieldRules: Array<FormRule> = (rules.value[item.field] = []);
    if (item.$required) {
      fieldRules.push({
        required: true,
        message: typeof item.$required == 'string' ? item.$required : `${item.title}不能为空`,
      });
    }
    const validate = item.validate;
    if (validate && Array.isArray(validate)) {
      fieldRules.push(...validate);
    }
    if (item.type === 'select') {
      item.visiable = false;
    }
    rules.value[item.field] = fieldRules;
  });
  console.log(rules);
};
// 根据value获取label
const getLabelByValue = (value: string, options: Array<PickerOption>): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label || '';
};

watch(
  () => formData.value,
  () => {
    emit('update:modelValue', formData.value);
  },
  {
    deep: true,
  }
);
onMounted(() => {
  initRenderRules();
});

// 提交数据
async function handleSubmit() {
  const result = await formRef.value?.submit();
  if (result === true) {
    console.log('验证通过 ✅');
    console.log('表单数据:', formData);
    emit('submit', formData.value);
  } else {
    console.log('验证失败 ❌', result);
  }
}

function handleReset() {
  formRef.value?.reset();
  console.log('已重置表单');
}

function handleClearValidate() {
  formRef.value?.clearValidate();
  console.log('已清除验证结果');
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.tdf-container {
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.form-content {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
  flex: 1;
  height: 0;
}

.bottom-actions {
  display: flex;
  justify-content: center;
}

.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
}

.picker-value {
  font-size: 16px;
  color: #333;
}

.picker-arrow {
  color: #999;
}
</style>
