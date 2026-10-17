<script setup lang="ts">
// 新增自定义列弹窗
import type { GridOps } from '../hooks/useGridOps';

defineOptions({ name: 'AddColumnDialog' });
const props = defineProps<{ ops: GridOps }>();

const { colDialogVisible, colForm, confirmAddCol } = props.ops;
</script>

<template>
  <el-dialog v-model="colDialogVisible" title="新增自定义列" width="420px" class="dt-dlg">
    <el-form label-width="80px">
      <el-form-item label="列名" required>
        <el-input v-model="colForm.name" placeholder="如：手机号" maxlength="20" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="colForm.type" style="width: 100%">
          <el-option label="文本" value="text" />
          <el-option label="数字" value="number" />
          <el-option label="下拉" value="select" />
          <el-option label="日期" value="date" />
        </el-select>
      </el-form-item>
      <el-form-item label="下拉选项" v-if="colForm.type === 'select'">
        <el-input v-model="colForm.options" placeholder="逗号分隔，如：A,B,C" />
      </el-form-item>
      <el-form-item label="必填">
        <el-switch v-model="colForm.required" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="colDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmAddCol">确定</el-button>
    </template>
  </el-dialog>
</template>
