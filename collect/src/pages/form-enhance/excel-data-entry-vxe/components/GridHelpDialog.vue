<script setup lang="ts">
// 快捷键与操作帮助面板（F1 唤出）：分组列出录入台已支持的键鼠操作。
// 经 el-dialog teleport 到 body，根元素挂 .dt-dlg 类以继承主题变量（见 theme.css 说明）
defineOptions({ name: 'GridHelpDialog' });

defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();
const close = () => emit('close');
// el-dialog 经 Esc / 遮罩关闭时同步到父级（:model-value 受控写法）
const onDialogUpdate = (v: boolean) => {
  if (!v) close();
};

const groups: { title: string; items: [string, string][] }[] = [
  {
    title: '导航',
    items: [
      ['方向键', '移动当前格'],
      ['Shift + 方向键', '扩展框选区域'],
      ['Tab / Shift+Tab', '右移 / 左移（行尾回绕下一行）'],
      ['Enter / Shift+Enter', '下移 / 上移'],
      ['F2 / 双击', '编辑当前单元格'],
      ['Esc', '退出编辑'],
    ],
  },
  {
    title: '框选',
    items: [
      ['鼠标拖动', '框选单元格区域'],
      ['Shift + 点击', '以活动格为基准扩展选区'],
      ['点击序号格', '选中整行'],
      ['Ctrl+A', '全选整个数据区'],
    ],
  },
  {
    title: '编辑与填充',
    items: [
      ['Delete / Backspace', '清空选区（无选区则清当前格）'],
      ['Ctrl+Enter', '用活动格的值填充整个选区'],
      ['Ctrl+D', '向下填充：选区首行逐列复制到其余行'],
      ['拖右下角 ▢', '纵向填充手柄（向上/向下均可）'],
    ],
  },
  {
    title: '剪贴板',
    items: [
      ['Ctrl+C', '复制选区（源区域显示蚂蚁线，可粘回 Excel）'],
      ['Ctrl+V', '粘贴到选区左上角（非法值自动跳过并提示）'],
      ['Esc', '取消复制（蚂蚁线消失）'],
    ],
  },
  {
    title: '其他',
    items: [
      ['Ctrl+Z / Ctrl+Y', '撤销 / 重做'],
      ['Ctrl+F', '查找替换'],
      ['右键', '上下文菜单（复制 / 粘贴 / 插行 / 清空 / 删行）'],
      ['F1', '打开 / 关闭本帮助'],
    ],
  },
];
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="快捷键与操作指南"
    width="560px"
    class="dt-dlg"
    @close="close"
    @update:model-value="onDialogUpdate"
  >
    <div class="dt-help">
      <div v-for="g in groups" :key="g.title" class="dt-help-group">
        <div class="dt-help-title">{{ g.title }}</div>
        <div v-for="it in g.items" :key="it[0]" class="dt-help-row">
          <span class="dt-help-key">{{ it[0] }}</span>
          <span class="dt-help-desc">{{ it[1] }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.dt-help { display: flex; flex-direction: column; gap: 4px; }
.dt-help-group { padding: 2px 0 6px; }
.dt-help-group + .dt-help-group { border-top: 1px solid var(--dt-border); }
.dt-help-title {
  font-size: 12px; font-weight: 650; color: var(--dt-primary);
  margin: 6px 0 4px; letter-spacing: .02em;
}
.dt-help-row { display: flex; align-items: baseline; gap: 10px; font-size: 12.5px; padding: 2.5px 0; }
.dt-help-key {
  flex: none; min-width: 132px; font-weight: 600; color: var(--dt-text);
  font-family: 'Cascadia Code', Consolas, 'Courier New', monospace; font-size: 12px;
}
.dt-help-desc { color: var(--dt-sub); }
</style>
