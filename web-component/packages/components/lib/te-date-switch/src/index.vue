<!--
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-01-18 11:32:36
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-21 17:18:33
 * @FilePath: \nts-eam-front\src\views\maintenance-management\maintenance-calendar\components\custom-date-picker\custom-date-picker.vue
 * @Description: 日期选择组件，可选择年或月的类型，通过按钮快捷切换上下年份或月份
-->
<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { useDateSwitch } from './hooks/useDateSwitch';
import {
  DateTypeEnum,
  DateSwitchProps,
  ActionTypeEnum,
  dateSwitchEmits,
} from './type';
import { TeButton, TeDatePicker, TeIcon } from '@tiansu/element-plus';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

// 默认为年份选择器
const props = withDefaults(defineProps<DateSwitchProps>(), {
  modelValue: '',
  type: DateTypeEnum.YEAR,
  format: 'YYYY',
  valueFormat: 'YYYY',
  forwardLimit: true,
});

// 添加v-model便于使用
const emits = defineEmits(dateSwitchEmits);
const pickerRef = ref<InstanceType<typeof TeDatePicker>>();

const { type, format, valueFormat, forwardLimit } = toRefs(props);

const { currentDate, dynamicStyle, canForward, handleDateChange } =
  useDateSwitch({
    type,
    format,
    forwardLimit,
    props,
    emits,
  });

// 可以在这里拿到初始值
defineExpose({
  currentDate,
  pickerRef,
});
</script>
<template>
  <section class="te-date-switch">
    <te-button
      class="arrow-button"
      @click="() => handleDateChange(ActionTypeEnum.BACKWARD)"
    >
      <te-icon>
        <ArrowLeft />
      </te-icon>
    </te-button>
    <te-date-picker
      popper-class="custom-date-picker"
      ref="pickerRef"
      v-bind="$attrs"
      v-model="currentDate"
      :type="type"
      :format="format"
      :value-format="valueFormat"
      :style="dynamicStyle"
      @change="(val:string)=>handleDateChange(ActionTypeEnum.DATE_CHANGE,val)"
    >
      <!-- 保留datepicker的功能，插槽当然不能忘 -->
      <template v-for="k in Object.keys($slots)" #[k]="scope" :key="k">
        <slot :name="k" v-bind="scope"></slot>
      </template>
    </te-date-picker>
    <te-button
      class="arrow-button"
      @click="() => handleDateChange(ActionTypeEnum.FORWARD)"
      :disabled="!canForward"
    >
      <te-icon>
        <ArrowRight />
      </te-icon>
    </te-button>
  </section>
</template>

<style scoped lang="scss">
.te-date-switch {
  .arrow-button {
    width: 32px;
    height: 32px;
  }

  .arrow-button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  .arrow-button:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }

  :deep(.te-date-editor) {
    width: 84px;
    height: 32px;
    color: var(--te-text-color-primary);
    text-align: center;

    .te-input__wrapper {
      border-radius: 0;
    }

    .te-input__prefix-inner {
      display: none;
    }

    .te-input__suffix-inner {
      display: none;
    }

    .te-input__inner {
      text-align: center;
      font-size: var(--te-font-size-b14);
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
    }
  }
}
</style>
