<script setup lang="ts">
// 日期单元格编辑器：基于 element-plus el-date-picker
// 角色：cells/index.ts 把本组件注册为 vxe 的 'dt-el-date' 编辑渲染器；
// value-format 固定 'YYYY-MM-DD'（与列校验/导出/复制粘贴格式一致，避免格式漂移）。
const model = defineModel<string>();
</script>

<template>
  <!-- ⚠️ 必须带 class="dt-el-editor"（去边框/透明底/撑满格高）；value-format 与全局日期格式约定保持一致 -->
  <el-date-picker
    v-model="model"
    type="date"
    value-format="YYYY-MM-DD"
    size="small"
    class="dt-el-editor"
    style="width: 100%"
  />
</template>
