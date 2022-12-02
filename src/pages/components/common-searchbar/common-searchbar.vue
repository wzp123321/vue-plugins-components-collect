<template>
  <el-form
    :inline="true"
    :model="modelValue"
    class="common-searchbar"
    id="common-searchbar"
  >
    <el-form-item
      v-for="(item, index) in searchFormItemList"
      :key="'formitem_' + index"
      :label="item.label"
    >
      <!-- 输入框 -->
      <template v-if="item.type === CS_ESearchBarType.输入框">
        <input
          type="text"
          v-model="modelValue[item.key]"
          :placeholder="item.placeholder"
          :maxlength="item.options.maxlength"
          @change="handleChange($event, item.key, item.change)"
        />
      </template>
      <!-- 下拉框 -->
      <template v-if="item.type === CS_ESearchBarType.下拉框">
        <el-select
          v-model="modelValue[item.key]"
          :placeholder="item.placeholder"
          @change="handleChange($event, item.key, item.change)"
        >
          <el-option
            v-for="(childItem, childIndex) in item.dataSource"
            :key="childItem?.[String(item.options?.value)] + childIndex"
            :label="childItem?.[String(item.options?.label)]"
            :value="childItem[String(item.options.value)]"
          ></el-option>
        </el-select>
      </template>
      <!-- 时间选择器 -->
      <template v-if="item.type === CS_ESearchBarType.日期选择器">
        <el-date-picker
          v-model="modelValue[item.key]"
          :placeholder="item.placeholder"
          :type="item.options?.datepickerType"
        />
      </template>

      <!-- <component
        :is="loadComponent(item.type)"
        :placeholder="item.placeholder"
        :value="pageForm[item.key]"
        @change="handleChange($event, item.key, item.type, item.change)"
      ></component> -->
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { PropType, ref, watch } from 'vue'
import { ElInput, ElSelect, ElOption, ElDatePicker } from 'element-plus'

import { CS_ESearchBarType, CS_ISearchBarVO } from './common-searchbar.api'

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ [key: string]: any }>,
    default: {},
  },
  searchFormItemList: {
    type: Array as PropType<CS_ISearchBarVO[]>,
    default: [],
  },
})

const emit = defineEmits(['modelValue:update'])

// const pageForm = ref<CommonObject>({})

// watch(
//   () => props.modelValue,
//   () => {
//     pageForm.value = props.modelValue
//   },
//   {
//     immediate: true,
//   }
// )

const handleChange = (
  value: string | Event,
  key: string,
  changeFn?: (value: string | Event) => void
) => {
  emit('modelValue:update', {
    ...props.modelValue,
    [key]: value,
  })
  if (typeof changeFn === 'function') {
    changeFn(value)
  }
}
</script>
<style lang="less" scoped></style>
