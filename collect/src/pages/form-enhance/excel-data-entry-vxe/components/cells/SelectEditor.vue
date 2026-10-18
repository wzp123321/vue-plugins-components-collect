<script setup lang="ts">
// 下拉单元格编辑器：基于 element-plus el-select
// 角色：cells/index.ts 把本组件注册为 vxe 的 'dt-el-select' 编辑渲染器；
// options 由 makeEditRenderer 透传（renderOpts.options），即该列 ColDef.options。
const model = defineModel<any>();
const props = defineProps<{ options?: string[] }>();
</script>

<template>
  <!-- ⚠️ 必须带 class="dt-el-editor"（去边框/透明底/撑满格高）；宽度 100% 充满单元格 -->
  <el-select v-model="model" size="small" class="dt-el-editor" style="width: 100%">
    <el-option v-for="o in (props.options || [])" :key="o" :label="o" :value="o" />
  </el-select>
</template>
