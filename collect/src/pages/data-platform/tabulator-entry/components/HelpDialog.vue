<script setup lang="ts">
// 操作与快捷键帮助（F1）。对应 vxe 版 GridHelpDialog / Univer 版 HelpDialog。
//
// 与另两套的差别：Tabulator 的选区、剪贴板、填充柄、键盘导航都是**内置模块**（SelectRange /
// Clipboard / Keybindings），本站只接管了查找、撤销重做与工具条动作。所以这里分两张表：
// ① 本站接管的；② 模块自带、但不列出来用户不会知道能按的。
defineOptions({ name: 'HelpDialog' });

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

interface KeyRow {
  keys: string;
  desc: string;
}

/** 本站接管或自定义的快捷键 */
const OURS: KeyRow[] = [
  { keys: 'Ctrl + F', desc: '打开查找替换（命中格标黄，可逐项跳转 / 全部替换）' },
  { keys: 'F1', desc: '打开本帮助' },
  { keys: 'Ctrl + Z', desc: '撤销（自带快照栈：单格编辑、填充、粘贴、删行都能回退）' },
  { keys: 'Ctrl + Y / Ctrl + Shift + Z', desc: '重做' },
];

/** Tabulator 内置模块可用（本页未禁用） */
const NATIVE: KeyRow[] = [
  { keys: '↑ ↓ ← → / Tab / Shift + Tab', desc: '移动活动单元格' },
  { keys: 'Shift + 方向键', desc: '从活动格扩展选区（可跨行跨列）' },
  { keys: '拖拽 / Ctrl + 方向键', desc: '鼠标框选矩形区域 / 跳到当前区域边缘' },
  { keys: 'Ctrl + C / Ctrl + V', desc: '复制 / 粘贴选区（纯 TSV，可直接与 Excel 互贴，粘贴从选区左上角开始铺）' },
  { keys: '拖右下角填充柄', desc: '把选区内容向下或向右填充（一次只沿一个方向延伸）' },
  { keys: 'Delete / Backspace', desc: '清空选区内容' },
  { keys: '双击 / Enter', desc: '进入单元格编辑；Esc 取消、Enter 提交（单击只选中不编辑）' },
  { keys: '点列头 / 列头输入框', desc: '按该列排序 / 按该列筛选（高亮按行身份挂，不会错行）' },
  { keys: '右键单元格', desc: '插入行 / 复制行 / 删除行 / 打开该列配置 / 查找替换' },
];

const close = () => emit('update:visible', false);
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    title="操作与快捷键"
    width="560px"
    class="ue-dlg"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div class="hd-body">
      <div class="hd-section">
        <div class="hd-title">本站接管</div>
        <div v-for="r in OURS" :key="r.keys" class="hd-row">
          <kbd>{{ r.keys }}</kbd>
          <span>{{ r.desc }}</span>
        </div>
      </div>
      <div class="hd-section">
        <div class="hd-title">Tabulator 内置模块（本页已开启，无需额外接线）</div>
        <div v-for="r in NATIVE" :key="r.keys" class="hd-row">
          <kbd>{{ r.keys }}</kbd>
          <span>{{ r.desc }}</span>
        </div>
      </div>
      <div class="hd-note">
        提示：列头下方的输入框是筛选（真正收起行）、点列头标题是排序；工具条「全局搜索」只标黄不收起行集。
        选区的行身份按 rowId 记，筛选或排序后右键操作仍作用在你看得见的那几行。
      </div>
    </div>
    <template #footer>
      <el-button size="small" type="primary" @click="close">知道了</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.hd-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.hd-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hd-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ue-text);
}
.hd-row {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 10px;
  align-items: start;
  font-size: 12px;
  color: var(--ue-sub);
  line-height: 1.6;
}
kbd {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid var(--ue-border);
  border-radius: var(--ai-radius-xs);
  background: var(--ue-bg);
  color: var(--ue-text);
  font-family: inherit;
  font-size: 12px;
  text-align: center;
}
.hd-note {
  font-size: 12px;
  color: var(--ue-sub);
  line-height: 1.6;
  padding-top: 4px;
  border-top: 1px dashed var(--ue-border);
}
</style>
