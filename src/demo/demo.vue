<template>
  <div id="demo">
    {{ modelValue }}
    <CommonSearchBar
      :searchFormItemList="searchFormItemList"
      v-model:modelValue="modelValue"
    ></CommonSearchBar>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {
  CS_ISearchBarVO,
  CS_ESearchBarType,
} from '../pages/components/common-searchbar/common-searchbar.api'
import CommonSearchBar from '../pages/components/common-searchbar/common-searchbar.vue'

const modelValue = ref({
  title: '',
  age: '12312312',
  date: new Date(),
})

const searchFormItemList: CS_ISearchBarVO[] = [
  {
    type: CS_ESearchBarType.下拉框,
    key: 'time',
    label: '下拉框',
    placeholder: '请选择',
    options: {
      value: 'code',
      label: 'name',
    },

    dataSource: [
      {
        code: '777',
        label: '测猜7测',
      },
      {
        code: '132883133',
        label: '测猜8322测',
      },
      {
        code: '888',
        label: '测猜3测',
      },
    ],
  },
  {
    type: CS_ESearchBarType.输入框,
    key: 'title',
    label: '我在测试',
    placeholder: '请输入',
    options: {
      maxlength: 20,
    },
  },
  {
    type: CS_ESearchBarType.下拉框,
    key: 'age',
    label: '下拉框',
    placeholder: '请选择',
    options: {
      value: 'code',
      label: 'name',
    },

    dataSource: [
      {
        code: '12312312',
        label: '测猜测',
      },
      {
        code: '1323133',
        label: '测猜322测',
      },
      {
        code: '123133332312',
        label: '测猜3测',
      },
    ],
  },
  {
    type: CS_ESearchBarType.日期选择器,
    key: 'date',
    label: '我在测试',
    placeholder: '请输入',
    options: {
      datepickerType: 'date',
    },
  },
]
</script>
<style lang="less" scoped></style>
