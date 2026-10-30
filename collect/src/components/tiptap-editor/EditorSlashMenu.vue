<template>
  <teleport to="body">
    <div v-if="isVisible" ref="menuRef" class="slash-command-menu" :style="menuStyle" @mousedown.prevent>
      <div v-if="filteredItems.length > 0" class="slash-command-list">
        <button
          v-for="(item, index) in filteredItems"
          :key="item.id"
          class="slash-command-item"
          :class="{ active: index === selectedIndex }"
          @click="selectItem(item)"
          @mouseenter="selectedIndex = index"
        >
          <span class="slash-command-item-icon" v-html="item.icon" />
          <span class="slash-command-item-content">
            <span class="slash-command-item-title">{{ item.title }}</span>
            <span class="slash-command-item-desc">{{ item.description }}</span>
          </span>
        </button>
      </div>
      <div v-else class="slash-command-empty">无匹配结果</div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
/**
 * EditorSlashMenu - 斜杠命令菜单
 * @description 参考 hlms-bi-front 的 SlashCommandMenu 移植：
 * 段落开头输入 / 弹出块类型选择，支持拼音/英文关键词过滤与键盘导航
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { slashCommandKey, type SlashCommandState } from './extensions/slashCommand';

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  action: (editor: Editor) => void;
}

const props = defineProps<{
  editor: Editor | null | undefined;
}>();

const isVisible = ref(false);
const position = ref({ x: 0, y: 0 });
const query = ref('');
const selectedIndex = ref(0);
const menuRef = ref<HTMLElement | null>(null);

const commandItems: SlashCommandItem[] = [
  {
    id: 'paragraph',
    title: '正文',
    description: '普通段落文本',
    icon: 'P',
    keywords: ['paragraph', 'text', 'plain', '正文', '段落', 'p'],
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'heading1',
    title: '标题 1',
    description: '一级标题',
    icon: 'H1',
    keywords: ['heading', 'h1', '标题', '一级标题', 'title'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading2',
    title: '标题 2',
    description: '二级标题',
    icon: 'H2',
    keywords: ['heading', 'h2', '标题', '二级标题', 'subtitle'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    title: '标题 3',
    description: '三级标题',
    icon: 'H3',
    keywords: ['heading', 'h3', '标题', '三级标题'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bulletList',
    title: '无序列表',
    description: '圆点符号列表',
    icon: '•',
    keywords: ['bullet', 'list', 'unordered', '无序列表', '列表', 'ul'],
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: '有序列表',
    description: '数字编号列表',
    icon: '1.',
    keywords: ['ordered', 'list', 'number', '有序列表', '编号列表', 'ol'],
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'taskList',
    title: '任务列表',
    description: '可勾选的待办列表',
    icon: '☑',
    keywords: ['task', 'todo', 'checklist', '任务列表', '待办', 'checkbox'],
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'blockquote',
    title: '引用',
    description: '引用块',
    icon: '❝',
    keywords: ['quote', 'blockquote', '引用', '引述'],
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'codeBlock',
    title: '代码块',
    description: '等宽预格式文本',
    icon: '&lt;/&gt;',
    keywords: ['code', 'block', '代码块', '代码', 'pre'],
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'table',
    title: '表格',
    description: '插入 3 × 3 表格',
    icon: '▦',
    keywords: ['table', '表格', 'grid'],
    action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'horizontalRule',
    title: '分割线',
    description: '水平分割线',
    icon: '―',
    keywords: ['divider', 'hr', 'horizontal', 'rule', '分割线', '水平线'],
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

const filteredItems = computed(() => {
  const q = query.value.toLowerCase();
  if (!q) return commandItems;
  return commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) || item.keywords.some((keyword) => keyword.toLowerCase().includes(q)),
  );
});

const menuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 1003,
}));

const hide = () => {
  // 守卫：已隐藏时直接返回。否则 hide() 内的 dispatch 会触发插件 view.update →
  // onDeactivate → hide() 再次 dispatch，形成无限递归（栈溢出）
  if (!isVisible.value) return;
  isVisible.value = false;
  query.value = '';
  selectedIndex.value = 0;

  const editor = props.editor;
  if (editor) {
    const { tr } = editor.state;
    tr.setMeta(slashCommandKey, { deactivate: true });
    editor.view.dispatch(tr);
  }
}

const selectItem = (item: SlashCommandItem) => {
  const editor = props.editor;
  if (!editor) return;

  // 先删除 / 及其后的查询文本，再执行命令
  const pluginState = slashCommandKey.getState(editor.state) as SlashCommandState | undefined;
  if (pluginState?.range) {
    editor.chain().focus().deleteRange(pluginState.range).run();
  }
  item.action(editor);
  hide();
}

/** 视口边缘防溢出 */
const adjustPosition = () => {
  const el = menuRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const margin = 8;
  let { x, y } = position.value;

  if (x + rect.width + margin > window.innerWidth) {
    x = window.innerWidth - rect.width - margin;
  }
  if (y + rect.height + margin > window.innerHeight) {
    y -= rect.height + 24;
  }
  position.value = { x: Math.max(margin, x), y: Math.max(margin, y) };
}

const activate = (state: SlashCommandState) => {
  if (!state.decorationPosition) return;
  position.value = { x: state.decorationPosition.x, y: state.decorationPosition.y + 4 };
  query.value = state.query;
  isVisible.value = true;
  selectedIndex.value = 0;
  nextTick(adjustPosition);
}

const updateQuery = (newQuery: string) => {
  query.value = newQuery;
  selectedIndex.value = 0;
}

const scrollToSelected = () => {
  nextTick(() => {
    const activeItem = menuRef.value?.querySelector('.slash-command-item.active');
    activeItem?.scrollIntoView({ block: 'nearest' });
  });
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!isVisible.value) return;

  const total = filteredItems.value.length;
  if (total === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % total;
      scrollToSelected();
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + total) % total;
      scrollToSelected();
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredItems.value[selectedIndex.value]) {
        selectItem(filteredItems.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      hide();
      break;
    default:
      break;
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown, true);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown, true);
});

watch(query, () => {
  selectedIndex.value = 0;
});

defineExpose({ activate, hide, updateQuery, isVisible });
</script>

<style lang="less" scoped>
.slash-command-menu {
  width: 248px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.slash-command-list {
  display: flex;
  flex-direction: column;
  padding: 6px;
}

.slash-command-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border: none;
  border-radius: var(--ai-radius-sm);
  background: transparent;
  cursor: pointer;
  text-align: left;

  &:hover,
  &.active {
    background: #ecf5ff;
  }
}

.slash-command-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
  border-radius: var(--ai-radius-xs);
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.slash-command-item-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slash-command-item-title {
  font-size: 13px;
  color: #303133;
}

.slash-command-item-desc {
  font-size: 11px;
  color: #909399;
}

.slash-command-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}
</style>
