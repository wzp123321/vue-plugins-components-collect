<template>
  <bubble-menu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100, placement: 'top', offset: [0, 10] }"
    :should-show="shouldShow"
    class="editor-table-menu"
  >
    <div class="table-toolbar">
      <div class="table-toolbar-row">
        <span class="table-toolbar-label">行</span>
        <el-button size="small" title="上方插入行" @click="exec((chain) => chain.addRowBefore())">上+</el-button>
        <el-button size="small" title="下方插入行" @click="exec((chain) => chain.addRowAfter())">下+</el-button>
        <el-button size="small" title="删除当前行" @click="exec((chain) => chain.deleteRow())">删行</el-button>
      </div>
      <div class="table-toolbar-row">
        <span class="table-toolbar-label">列</span>
        <el-button size="small" title="左侧插入列" @click="exec((chain) => chain.addColumnBefore())">左+</el-button>
        <el-button size="small" title="右侧插入列" @click="exec((chain) => chain.addColumnAfter())">右+</el-button>
        <el-button size="small" title="删除当前列" @click="exec((chain) => chain.deleteColumn())">删列</el-button>
      </div>
      <div class="table-toolbar-row">
        <span class="table-toolbar-label">单元格</span>
        <el-button size="small" title="合并单元格（需多选）" @click="exec((chain) => chain.mergeCells())">合并</el-button>
        <el-button size="small" title="拆分单元格" @click="exec((chain) => chain.splitCell())">拆分</el-button>
        <el-button size="small" title="切换表头行" @click="exec((chain) => chain.toggleHeaderRow())">表头行</el-button>
        <el-button size="small" title="切换表头列" @click="exec((chain) => chain.toggleHeaderColumn())">表头列</el-button>
      </div>
      <div class="table-toolbar-row">
        <el-button size="small" type="danger" plain title="删除整个表格" @click="exec((chain) => chain.deleteTable())">
          删除表格
        </el-button>
      </div>
    </div>
  </bubble-menu>
</template>

<script lang="ts" setup>
/**
 * EditorTableMenu - 表格浮动工具栏
 * @description 参考 hlms-bi-front 的 TableToolbar：光标处于表格内时
 * 在选区上方浮出行列/单元格操作（TipTap Table 扩展自带命令）
 */
import { computed } from 'vue';
import { BubbleMenu } from '@tiptap/vue-3/menus';
import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';
import type { Editor } from '@tiptap/vue-3';
import { createCommandRunner } from './utils/editorCommands';

const props = defineProps<{
  editor: Editor | null | undefined;
  readonly?: boolean;
}>();

const editor = computed(() => props.editor ?? null);
const run = createCommandRunner(editor);
const exec = (fn: Parameters<typeof run>[0]) => run(fn)();

/** BubbleMenu 组件 shouldShow 回调的参数类型（editor 为 @tiptap/core 的 Editor，非 vue-3 子类） */
type ShouldShowProps = Parameters<NonNullable<BubbleMenuPluginProps['shouldShow']>>[0];

/** 光标在表格内即显示（含只读守卫） */
const shouldShow = (bubbleProps: ShouldShowProps) => {
  if (props.readonly) return false;
  return bubbleProps.editor.isActive('table');
};
</script>

<style lang="less" scoped>
.editor-table-menu {
  z-index: 1002;
}

.table-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-toolbar-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.table-toolbar-label {
  width: 44px;
  flex-shrink: 0;
  font-size: 11px;
  color: #909399;
}
</style>
