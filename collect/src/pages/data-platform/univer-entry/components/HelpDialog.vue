<script setup lang="ts">
// 操作与快捷键帮助（F1）。对应 vxe 版 GridHelpDialog。
//
// 与 vxe 版的差别：vxe 版的快捷键是自研 useGridKeys 全套实现的，所以帮助里列的全是"本站自定义"；
// Univer 版的移动/选中/编辑/复制粘贴/撤销都是画布自己实现的，本站只接管了 Ctrl+F 与提交前刷新，
// 因此这里分两张表：① 本站接管/自定义的；② Univer 原生可用的（写出来是因为画布表格"看不见菜单"，
// 不列出来用户根本不知道能按）。
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
  { keys: 'Ctrl + Z', desc: '撤销（走 Univer 命令栈，含格式与数据验证变更）' },
  { keys: 'Ctrl + Y / Ctrl + Shift + Z', desc: '重做' },
];

/** Univer 画布表格原生可用（本页未禁用） */
const NATIVE: KeyRow[] = [
  { keys: '↑ ↓ ← → / Tab / Enter', desc: '移动活动单元格（Enter 下移、Tab 右移）' },
  { keys: 'Shift + 方向键', desc: '扩展选区' },
  { keys: '拖拽', desc: '框选矩形区域；点列头 / 行号选整列 / 整行' },
  { keys: 'Ctrl + C / V / X', desc: '复制 / 粘贴 / 剪切（带蚂蚁线，支持从 Excel 粘贴整块）' },
  { keys: '拖右下角填充柄', desc: '序列填充（数字等差、日期按天递增，与 Excel 一致）' },
  { keys: 'Delete / Backspace', desc: '清空选中内容' },
  { keys: '双击 / 直接键入', desc: '进入单元格编辑；Esc 取消、Enter 提交' },
  { keys: 'Ctrl + 滚轮', desc: '缩放画布' },
  { keys: '右键', desc: '原生上下文菜单（插入 / 删除行列、合并、清除格式等）' },
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
        <div class="hd-title">Univer 原生（画布自带，无菜单可点）</div>
        <div v-for="r in NATIVE" :key="r.keys" class="hd-row">
          <kbd>{{ r.keys }}</kbd>
          <span>{{ r.desc }}</span>
        </div>
      </div>
      <div class="hd-note">
        提示：列头漏斗 = 筛选 / 排序；工具条「全局搜索」只标黄不收起行，需要收起行集请用列头筛选。
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
