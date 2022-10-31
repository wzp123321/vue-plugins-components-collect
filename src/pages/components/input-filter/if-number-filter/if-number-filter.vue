<template>
  <div class="if-number-filter">
    <a-divider>数字过滤</a-divider>
    <div class="flex mb16">
      <input class="mr12" type="text" v-model="numberFilter.integer" />
      <input class="mr12" type="text" v-model="numberFilter.decimals" />
      <a-switch v-model:checked="numberFilter.is_negative" />
      是否允许负数
      <a-switch v-model:checked="numberFilter.allowZero" />
      是否允许0
    </div>
    <input
      type="text"
      v-model="numberFilter.value"
      @input="numberFilter.input"
    />
  </div>
</template>
<script lang="ts" setup>
import { defineComponent, defineProps } from 'vue'
import NumberFilterService from './if-number-filter.service'
import { Divider, Switch } from 'ant-design-vue'

defineComponent({
  'a-divider': Divider,
  'a-switch': Switch,
})
defineProps({
  /**
   * 双向绑定数据
   */
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * 整数位
   */
  integer: {
    type: Number,
    default: 10,
  },
  /**
   * 小数位
   */
  decimals: {
    type: Number,
    default: 10,
  },
  isNegative: {
    type: Boolean,
    default: false,
  },
  allowZero: {
    type: Boolean,
    default: false,
  },
})
const numberFilter = new NumberFilterService()
</script>
<style lang="less" scoped>
.if-number-filter {
}
</style>
