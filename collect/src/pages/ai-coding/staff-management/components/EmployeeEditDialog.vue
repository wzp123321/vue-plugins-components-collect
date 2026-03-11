<template>
  <el-dialog v-model="visibleProxy" :title="isCreate ? '新增员工' : '编辑员工'" width="520px" append-to-body>
    <el-form :model="editRow" label-width="84px" v-if="editRow">
      <el-form-item label="姓名">
        <el-input
          v-model="editRow.name"
          v-inputFilter:text="{ allowChinese: true, allowSpace: false, regExp: null }"
          :maxlength="50"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="editRow.type" style="width: 240px">
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="editRow.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否离职">
        <el-switch v-model="editRow.departed" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visibleProxy = false">取消</el-button>
      <el-button type="primary" @click="$emit('save')">保存</el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import type { Employee, EmployeeType } from '../types';
const props = defineProps<{
  visible: boolean;
  isCreate: boolean;
  editRow: Employee | null;
  types: EmployeeType[];
}>();
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'save'): void;
}>();
const visibleProxy = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
});
</script>
<style lang="less" scoped></style>
