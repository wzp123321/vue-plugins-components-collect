<script setup lang="ts">
// 数字单元格编辑器：基于 element-plus el-input-number
// 角色：cells/index.ts 把本组件注册为 vxe 的 'dt-el-number' 编辑渲染器；
// 关闭步进按钮（controls=false）以保持单元格紧凑；空值默认 null（见 types.ts emptyValueFor）。
// 数值区间（最小值/最大值）由 useCellValidation 统一校验——越界单元格标红并在校验面板列明，
// 本组件只负责录入，不在输入框层硬拦截（负号与小数点的合法性交给校验层判定）。
const model = defineModel<number | null>();
</script>

<template>
  <!-- ⚠️ 必须带 class="dt-el-editor"（去边框/透明底/撑满格高）；controls=false 去除上下箭头，width 100% 充满单元格 -->
  <el-input-number
    v-model="model"
    size="small"
    :controls="false"
    class="dt-el-editor"
    style="width: 100%"
  />
</template>
