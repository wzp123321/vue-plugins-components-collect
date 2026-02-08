<template>
  <div class="if-number-filter">
    <el-divider>数字过滤</el-divider>
    <div class="flex mb16">
      <el-input class="mr12" type="text" v-model="numberFilter.integer" />
      <el-input class="mr12" type="text" v-model="numberFilter.decimals" />
      <el-switch v-model="numberFilter.is_negative" >
        是否允许负数
      </el-switch>
      <el-switch v-model="numberFilter.allowZero" >
        是否允许0
      </el-switch>
    </div>
    <el-input type="text" v-model="numberFilter.value" @input="numberFilter.input($event)" />
  </div>
</template>
<script lang="ts" setup>
import NumberFilterService from './if-number-filter.service';

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
});
const numberFilter = new NumberFilterService();
</script>
