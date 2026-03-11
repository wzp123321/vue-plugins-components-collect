<template>
  <el-dialog v-model="visibleProxy" title="员工详情" width="480px" append-to-body>
    <div class="detail" v-if="row">
      <div class="detail-item"><span>姓名</span><span>{{ row.name }}</span></div>
      <div class="detail-item"><span>类型</span><span>{{ row.type }}</span></div>
      <div class="detail-item"><span>性别</span><span>{{ row.gender }}</span></div>
      <div class="detail-item"><span>是否离职</span><span>{{ row.departed ? '是' : '否' }}</span></div>
    </div>
    <template #footer>
      <el-button @click="visibleProxy = false">关闭</el-button>
    </template>
  </el-dialog>
  </template>
<script lang="ts" setup>
import { computed } from 'vue';
import type { Employee } from '../types';
const props = defineProps<{
  visible: boolean;
  row: Employee | null;
}>();
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
}>();
const visibleProxy = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
});
</script>
<style lang="less" scoped>
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
</style>

