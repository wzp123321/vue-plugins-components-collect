<template>
  <TeSegmented
    v-model="analysisDimension"
    :theme="theme"
    :size="size"
    :show-icon="showIcon"
    :dimensionOptions="[
      { value: 0, text: '按天' },
      { value: 1, text: '按周' },
      { value: 2, text: '按月' },
      { value: 3, text: '按季度' },
      { value: 4, text: '按年' },
    ]"
    :style="{ background: theme === 'light' ? '#fff' : '#000' }"
  ></TeSegmented>
  <te-form size="small">
    <te-form-item label="主题" required>
      <te-radio-group v-model="theme">
        <te-radio label="light">浅色</el-radio>
        <te-radio label="dark">深色</el-radio>
      </el-radio-group>
    </el-form-item>
    <te-form-item label="尺寸" required>
      <te-radio-group v-model="size">
        <te-radio label="small">小</el-radio>
        <te-radio label="medium">中</el-radio>
        <te-radio label="large">大</el-radio>
      </el-radio-group>
    </el-form-item>
    <te-form-item label="图标" required>
      <te-radio-group v-model="showIcon">
        <te-radio :label="true">显示</el-radio>
        <te-radio :label="false">不显示</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { TeSegmented } from "@ts-web-package/components/lib/te-segmented";
import { TeForm, TeFormItem, TeRadioGroup, ElRadio } from "element-plus";
const analysisDimension = ref(0);
const theme = ref<"light" | "dark">("light");
const size = ref<"small" | "medium" | "large">("medium");
const showIcon = ref(true);
watch(
  () => analysisDimension.value,
  () => {
    console.log("watch changed", analysisDimension.value);
  },
  {
    deep: false,
    immediate: false,
  }
);
</script>
<script lang="ts">
export default {
  name: "te-segmented",
};
</script>
<style lang="less" scoped>
.te-segmented {
  padding: 20px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
}
</style>
