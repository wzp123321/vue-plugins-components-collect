<script setup lang="ts">
// 保存列结构为模板弹窗
import type { GridTemplates } from '../hooks/useGridTemplates';

defineOptions({ name: 'TemplateDialog' });
const props = defineProps<{ tpl: GridTemplates }>();

const { tplDialogVisible, tplName, confirmSaveTpl } = props.tpl;
</script>

<template>
  <el-dialog v-model="tplDialogVisible" title="保存为模板" width="380px" class="dt-dlg">
    <el-input v-model="tplName" placeholder="模板名称，如：员工主数据" maxlength="20" />
    <template #footer>
      <el-button @click="tplDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmSaveTpl">保存</el-button>
    </template>
  </el-dialog>
</template>
