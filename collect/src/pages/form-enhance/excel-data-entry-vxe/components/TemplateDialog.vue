<script setup lang="ts">
// 保存列结构为模板弹窗
// 本组件只收集模板名称并调用 useGridTemplates.confirmSaveTpl；模板仅持久化列结构（不存数据）。
// 协作：props.tpl(GridTemplates)→tplDialogVisible(显隐)/tplName(名称)/confirmSaveTpl(提交)
import type { GridTemplates } from '../hooks/useGridTemplates';

defineOptions({ name: 'TemplateDialog' });
const props = defineProps<{ tpl: GridTemplates }>();

// 解构：tplDialogVisible 双向绑定显隐；tplName 名称输入；confirmSaveTpl 把当前 ColDef 序列化存 localStorage
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
