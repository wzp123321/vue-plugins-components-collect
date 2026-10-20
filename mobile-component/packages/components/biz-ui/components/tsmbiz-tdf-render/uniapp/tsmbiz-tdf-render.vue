<template>
  <view class="tdf-container">
    <view class="form-content">
      <tsm-form ref="formRef" :model="formData" :rules="rules" scrollToFirstError="smooth" :readonly="readonly">
        <template v-for="(item, index) in dsl" :key="item._fc_id">
          <tsm-form-item :label="item.title" :name="item.field">
            <!-- 覆盖默认 label：题号 + 单选/多选的蓝色方括号标识 + 标题 -->
            <template #label>
              <text class="tdf-field-label"
                >{{ index + 1 }}.<text v-if="getChoiceTag(item)" class="tdf-field-label-tag">[{{ getChoiceTag(item) }}]</text> {{ item.title }}</text
              >
            </template>
            <template v-if="item.type === 'select'">
              <view class="picker-trigger" @click="item.visiable = true && !readonly">
                <text class="picker-value">{{
                  getLabelByValue(formData[item.field], item.options ?? []) || '请选择'
                }}</text>
                <icon-right class="picker-arrow" :size="16" />
              </view>
            </template>
            <component
              :is="componentsMap[item._fc_drag_tag]"
              v-model:value="formData[item.field]"
              v-model="formData[item.field]"
              :="item.props"
              v-bind="getPassThroughProps(item)"
              v-model:show="item.visiable"
              :options="item.options"
              :title="`选择${item.title}`"
              @esign-landscape-change="onLandscapeChange"
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
    <view v-if="props.hideFooter" class="bottom-actions">
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
import type { Rule, TdfRenderProps } from './props';
import { defaultProps } from './props';
import TsmEsign from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-esign/uniapp/tsm-esign.vue';
import TsmStepper from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-stepper/uniapp/tsm-stepper.vue';

const props = withDefaults(defineProps<TdfRenderProps>(), defaultProps);
const emit = defineEmits<{
  submit: [value: Record<string, any>];
  'update:modelValue': [value: Record<string, any>];
  /**
   * 横屏签字态变化（内部签名板 tsm-esign 进入/退出旋转横屏签名），参数为当前是否处于横屏签字
   * 事件名与 tsm-esign 自身派发的保持一致，外层在任意一层监听都能用同一个名字
   */
  'esign-landscape-change': [value: boolean];
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
  signaturePad: TsmEsign,
  inputNumber: TsmStepper,
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

/**
 * 题号后面的蓝色标识文案：只有选择题需要，用来区分单选还是多选。
 * 其余题型（输入框/计数器/签名等）返回空串，不展示标识。
 */
const getChoiceTag = (item: Rule): string => {
  if (item._fc_drag_tag === 'radio') return '单选';
  if (item._fc_drag_tag === 'checkbox') return '多选';
  return '';
};

/**
 * 输入类组件的默认字符上限：DSL 的 props.maxlength 优先，未配置时用这里的值兜底，
 * 保证页面上每个输入框都有明确的字数限制。
 */
const DEFAULT_MAXLENGTH: Record<string, number> = {
  input: 50,
  textarea: 200,
};

// DSL 的 props 是 Object 类型，取值前先收窄
const itemProps = (item: Rule): Record<string, any> => (item.props as Record<string, any>) ?? {};

/**
 * 输入框/多行输入框的字数限制：透传 maxlength，并打开字数统计（input 是 showWordimit、textarea 是 showCount）。
 * DSL 里显式配了同名字段时以 DSL 为准。
 */
const getMaxlengthProps = (item: Rule): Record<string, unknown> => {
  const defaultMaxlength = DEFAULT_MAXLENGTH[item._fc_drag_tag];
  if (!defaultMaxlength) return {};
  const configured = Number(itemProps(item).maxlength);
  const showKey = item._fc_drag_tag === 'textarea' ? 'showCount' : 'showWordimit';
  return {
    maxlength: configured > 0 ? configured : defaultMaxlength,
    [showKey]: itemProps(item)[showKey] ?? true,
  };
};

// 组件专属透传：签名板的（横屏旋转签字板顶部留白高度 + 编辑层是否挂到 body）、选择器弹层的（是否挂到 body）。
// 放在 `:="item.props"` 之后，DSL 里同名配置不会覆盖页面显式传入的 esignTopInset / esignTeleportToBody / selectTeleportToBody。
// 其余表单组件返回空对象，避免落下无意义的 DOM 属性。
const getPassThroughProps = (item: Rule): Record<string, unknown> => {
  if (item._fc_drag_tag === 'signaturePad') {
    return {
      landscapeTopInset: props.esignTopInset,
      teleportToBody: props.esignTeleportToBody,
    };
  }
  if (item._fc_drag_tag === 'select') {
    return {
      teleportToBody: props.selectTeleportToBody,
    };
  }
  return getMaxlengthProps(item);
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

// 横屏签字态：由内部签名板（tsm-esign）透传，外层可据此同步页面 UI（如隐藏导航栏/底部操作栏）
// 说明：只有签名板会派发该事件，其余表单组件不会触发
const isLandscape = ref(false);
const onLandscapeChange = (val: boolean): void => {
  isLandscape.value = val;
  emit('esign-landscape-change', val);
};

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

// 暴露内部表单实例，外层可通过组件的 ref 直接调用，如 xxxRef.value.formRef.validate()/submit()/reset()/clearValidate()（formRef 已自动解包）
// isLandscape 为当前是否处于横屏签字态（已自动解包，可在 computed 中直接使用）
defineExpose({ formRef, isLandscape });
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

/* 题号+标题：插槽内容归本组件所有，继承不到 tsm-form-item 的 scoped 样式，这里显式对齐其 label 文本样式 */
.tdf-field-label {
  color: var(--tsm-color-text-secondary, #717680);
  font-size: var(--tsm-font-size-text-l, 16px);
  line-height: var(--tsm-line-height-text-l, 24px);
  font-weight: var(--tsm-font-weight-regular);
  word-break: break-all;
}

/* 单选/多选标识：紧跟题号，靠左侧外边距留出间隙（嵌套 text 里不依赖空白节点），字号与标题一致 */
.tdf-field-label-tag {
  margin-left: 4px;
  color: var(--tsm-color-primary, #444ce7);
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
