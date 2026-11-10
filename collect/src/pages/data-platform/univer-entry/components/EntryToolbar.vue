<!--
  顶部工具条（纯 UI 层）：只保留录入台最核心的六个动作 + 右侧保存。
    ｜新增行 新增列 ｜撤销 重做 ｜搜索框 替换 ｜                         ｜保存｜
  其余能力（列设置抽屉 / 批量填充 / 模板 / 导入导出 / 合并 / 压测数据 / 条件格式开关）
  已从工具条移出，对应实现仍在 ops / io / sheetApi 里，需要时再接回来。

  视觉取向：不用 el-button。
  站点的 Element Plus 皮肤把按钮做成「实心块 + 描边方块」，一排放十几个就会像后台模板；
  这里改用原生 button + 自定义样式：文字型主操作、纯图标次要操作、一体化搜索框，
  整条带子只有右侧「保存」是实心主色，其余全部是透明底 + hover 淡底。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { CirclePlus, Close, DocumentChecked, EditPen, Plus, RefreshLeft, RefreshRight, Search } from '@element-plus/icons-vue';
import type { EntryOps } from '../useEntryOps';
import type { EntryFind } from '../useEntryFind';

defineOptions({ name: 'EntryToolbar' });

const props = defineProps<{
  ops: EntryOps;
  find: EntryFind;
}>();

const emit = defineEmits<{
  (e: 'add-column'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'save'): void;
}>();

const { addRow } = props.ops;
const openFind = props.find.open;
const quickSearch = props.find.quickSearch;
const hitCount = props.find.hitCount;

/** 搜索词直接读写查找实例的状态，工具条不另存一份，避免两处不同步 */
const keyword = computed({
  get: () => props.find.findText.value,
  set: (v: string) => quickSearch(v),
});
</script>

<template>
  <div class="ue-toolbar">
    <button class="tb-btn" type="button" @click="addRow">
      <el-icon><Plus /></el-icon>
      <span>新增行</span>
    </button>
    <button class="tb-btn" type="button" @click="emit('add-column')">
      <el-icon><CirclePlus /></el-icon>
      <span>新增列</span>
    </button>

    <span class="tb-sep" />

    <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom" :show-after="400">
      <button class="tb-btn is-icon" type="button" @click="emit('undo')">
        <el-icon><RefreshLeft /></el-icon>
      </button>
    </el-tooltip>
    <el-tooltip content="重做 (Ctrl+Y)" placement="bottom" :show-after="400">
      <button class="tb-btn is-icon" type="button" @click="emit('redo')">
        <el-icon><RefreshRight /></el-icon>
      </button>
    </el-tooltip>

    <span class="tb-sep" />

    <label class="tb-search">
      <el-icon class="tb-search-icon"><Search /></el-icon>
      <input v-model="keyword" type="text" placeholder="搜索全表，命中标黄" spellcheck="false" />
      <button v-if="keyword" class="tb-search-clear" type="button" title="清除" @click="quickSearch('')">
        <el-icon><Close /></el-icon>
      </button>
    </label>
    <span v-if="keyword.trim()" class="tb-count">{{ hitCount }} 命中</span>
    <el-tooltip content="查找替换 (Ctrl+F)" placement="bottom" :show-after="400">
      <button class="tb-btn is-icon" type="button" @click="openFind()">
        <el-icon><EditPen /></el-icon>
      </button>
    </el-tooltip>

    <span class="tb-spacer" />

    <button class="tb-btn is-primary" type="button" @click="emit('save')">
      <el-icon><DocumentChecked /></el-icon>
      <span>保存</span>
    </button>
  </div>
</template>

<style scoped>
/* 整条工具带：一块与表格同宽的白/深面板，只有 1px 描边，不加投影（投影会和表格面板打架） */
.ue-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 5px 6px;
  margin-bottom: var(--bi-gap, 10px);
  background: var(--bi-panel);
  border: 1px solid var(--bi-border);
  border-radius: var(--bi-radius, 8px);
}

/* 动作按钮：透明底，靠 hover 的淡底表达可点；图标比文字轻一档，hover 时一起提亮 */
.tb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--bi-text);
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.tb-btn:hover {
  background: var(--bi-hover);
}

.tb-btn:active {
  background: var(--bi-border-soft);
}

.tb-btn:focus-visible {
  outline: 2px solid var(--bi-primary);
  outline-offset: 1px;
}

.tb-btn .el-icon {
  font-size: 15px;
  color: var(--bi-sub);
  transition: color 0.15s ease;
}

.tb-btn:hover .el-icon {
  color: var(--bi-text);
}

/* 纯图标按钮：正方 30×30，与文字按钮同高，视觉上形成"段" */
.tb-btn.is-icon {
  width: 30px;
  padding: 0;
  justify-content: center;
}

/* 主操作：整条带子只有这一个实心按钮，避免"满屏蓝块" */
.tb-btn.is-primary {
  padding: 0 14px;
  background: var(--bi-primary);
  color: #fff;
  font-weight: 500;
}

.tb-btn.is-primary .el-icon {
  color: #fff;
}

.tb-btn.is-primary:hover {
  background: var(--bi-primary);
  filter: brightness(1.08);
}

.tb-btn.is-primary:active {
  background: var(--bi-primary);
  filter: brightness(0.96);
}

/* 分组分隔：1px 竖线，高度压到 16px，只做"停顿"不做"分割" */
.tb-sep {
  flex: 0 0 auto;
  width: 1px;
  height: 16px;
  margin: 0 6px;
  background: var(--bi-border);
}

/* 搜索框：一体化输入（图标 + 输入 + 清除），底纹比面板深一阶，聚焦时才描主色 */
.tb-search {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  width: 210px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: var(--bi-head-bg);
  cursor: text;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.tb-search:hover {
  border-color: var(--bi-border);
}

.tb-search:focus-within {
  background: var(--bi-panel);
  border-color: var(--bi-primary);
}

.tb-search-icon {
  font-size: 14px;
  color: var(--bi-sub);
}

.tb-search input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--bi-text);
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1;
}

.tb-search input::placeholder {
  color: var(--bi-sub);
}

.tb-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--bi-border);
  color: var(--bi-panel);
  font-size: 10px;
  cursor: pointer;
}

.tb-search-clear:hover {
  background: var(--bi-sub);
}

/* 命中计数：贴在搜索框右侧的小读数，不做成彩色标签 */
.tb-count {
  flex: 0 0 auto;
  margin: 0 2px 0 4px;
  font-size: 12px;
  color: var(--bi-sub);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tb-spacer {
  flex: 1 1 auto;
}
</style>
