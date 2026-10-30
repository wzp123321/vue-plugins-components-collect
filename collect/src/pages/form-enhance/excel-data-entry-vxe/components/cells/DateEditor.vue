<script setup lang="ts">
// 日期单元格编辑器：基于 element-plus el-date-picker
// 角色：cells/index.ts 把本组件注册为 vxe 的 'dt-el-date' 编辑渲染器；
// value-format 固定 'YYYY-MM-DD'（存储规范，与列校验/导出/复制粘贴格式一致，避免格式漂移）；
// dateFormat 来自列配置，仅控制编辑框与下拉的呈现格式（dateFormat 不影响绑定值）。
const model = defineModel<string>();
const props = defineProps<{ dateFormat?: string }>();
</script>

<template>
  <!-- ⚠️ 必须带 class="dt-el-editor"（去边框/透明底/撑满格高）；value-format 固定规范存储格式，format 用列配置格式呈现 -->
  <el-date-picker
    v-model="model"
    type="date"
    value-format="YYYY-MM-DD"
    :format="props.dateFormat || 'YYYY-MM-DD'"
    size="small"
    class="dt-el-editor"
    style="width: 100%"
  />
</template>
