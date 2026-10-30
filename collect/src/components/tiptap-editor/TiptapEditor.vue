<template>
  <div class="tiptap-editor" :style="{ '--editor-min-height': minHeightStyle }">
    <!-- 工具栏 -->
    <div v-if="editor" class="tiptap-toolbar">
      <div class="toolbar-row">
        <el-button-group>
          <el-button size="small" :disabled="!editor.can().undo()" @click="execUndo">撤销</el-button>
          <el-button size="small" :disabled="!editor.can().redo()" @click="execRedo">重做</el-button>
        </el-button-group>

        <el-button-group>
          <el-button
            v-for="format in textFormats"
            :key="format.name"
            size="small"
            :type="format.active ? 'primary' : 'default'"
            :title="format.title"
            @click="format.action"
          >
            <span v-html="format.label" />
          </el-button>
        </el-button-group>

        <el-dropdown size="small" @command="onHeadingChange">
          <el-button size="small">
            {{ currentHeadingLabel }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in headingOptions"
                :key="option.value"
                :command="option.value"
                :class="{ 'is-active-option': snapshot.paragraphStyle === option.value }"
              >
                <el-icon v-if="snapshot.paragraphStyle === option.value" class="option-check"><check /></el-icon>
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-select
          :model-value="snapshot.fontSize"
          size="small"
          style="width: 84px"
          placeholder="字号"
          @change="onFontSizeChange"
        >
          <el-option v-for="option in fontSizeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <el-select
          :model-value="snapshot.fontFamily"
          size="small"
          style="width: 108px"
          placeholder="字体"
          @change="onFontFamilyChange"
        >
          <el-option v-for="option in fontFamilyOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <el-select
          :model-value="snapshot.lineHeight"
          size="small"
          style="width: 92px"
          placeholder="行高"
          @change="onLineHeightChange"
        >
          <el-option v-for="option in lineHeightOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <el-dropdown size="small" @command="onAlignChange">
          <el-button size="small">
            {{ currentAlignLabel }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in alignOptions"
                :key="option.value"
                :command="option.value"
                :class="{ 'is-active-option': snapshot.align === option.value }"
              >
                <el-icon v-if="snapshot.align === option.value" class="option-check"><check /></el-icon>
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="toolbar-row">
        <el-button-group>
          <el-button size="small" :type="isActive('bulletList') ? 'primary' : 'default'" @click="exec((chain) => chain.toggleBulletList())">• 无序</el-button>
          <el-button size="small" :type="isActive('orderedList') ? 'primary' : 'default'" @click="exec((chain) => chain.toggleOrderedList())">1. 有序</el-button>
          <el-button size="small" :type="isActive('taskList') ? 'primary' : 'default'" @click="exec((chain) => chain.toggleTaskList())">☑ 任务</el-button>
        </el-button-group>

        <el-button-group>
          <el-button size="small" :type="isActive('subscript') ? 'primary' : 'default'" @click="exec((chain) => chain.toggleSubscript())">x₂</el-button>
          <el-button size="small" :type="isActive('superscript') ? 'primary' : 'default'" @click="exec((chain) => chain.toggleSuperscript())">x²</el-button>
        </el-button-group>

        <!-- 文字颜色 -->
        <el-popover v-model:visible="textColorVisible" placement="bottom" :width="248">
          <template #reference>
            <el-button size="small" title="文字颜色">
              <span class="color-button-label" :style="{ borderBottomColor: snapshot.textColor || '#909399' }">A</span>
            </el-button>
          </template>
          <div class="color-panel">
            <div class="color-grid">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :title="color"
                @click="chooseTextColor(color)"
              />
            </div>
            <div class="color-panel-footer">
              <el-color-picker :model-value="snapshot.textColor || undefined" size="small" @change="onTextColorPickerChange" />
              <el-button size="small" @click="clearTextColor">清除</el-button>
            </div>
          </div>
        </el-popover>

        <!-- 背景高亮 -->
        <el-popover v-model:visible="highlightVisible" placement="bottom" :width="248">
          <template #reference>
            <el-button size="small" title="背景颜色">
              <span class="color-button-label is-highlight" :style="{ backgroundColor: snapshot.highlightColor || 'transparent' }">A</span>
            </el-button>
          </template>
          <div class="color-panel">
            <div class="color-grid">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :title="color"
                @click="chooseHighlightColor(color)"
              />
            </div>
            <div class="color-panel-footer">
              <el-color-picker :model-value="snapshot.highlightColor || undefined" size="small" @change="onHighlightPickerChange" />
              <el-button size="small" @click="clearHighlight">清除</el-button>
            </div>
          </div>
        </el-popover>

        <!-- 链接 -->
        <el-popover v-model:visible="linkVisible" placement="bottom" :width="280">
          <template #reference>
            <el-button size="small" :type="isActive('link') ? 'primary' : 'default'" @click="openLinkPopover">链接</el-button>
          </template>
          <div class="link-panel">
            <el-input v-model="linkUrl" size="small" placeholder="https://example.com" @keyup.enter="applyLink" />
            <div class="panel-actions">
              <el-button size="small" type="primary" @click="applyLink">确认</el-button>
              <el-button size="small" @click="removeLink">取消链接</el-button>
            </div>
          </div>
        </el-popover>

        <!-- 图片 -->
        <el-popover v-model:visible="imageVisible" placement="bottom" :width="280">
          <template #reference>
            <el-button size="small" @click="imageVisible = true">图片</el-button>
          </template>
          <div class="image-panel">
            <el-input v-model="imageUrl" size="small" placeholder="图片地址 https://..." @keyup.enter="applyImageUrl" />
            <div class="panel-actions">
              <el-button size="small" type="primary" @click="applyImageUrl">插入</el-button>
              <el-button size="small" @click="pickImageFile">本地图片</el-button>
            </div>
          </div>
        </el-popover>
        <input ref="imageFileInput" type="file" accept="image/*" class="hidden-file-input" @change="onImageFileChange" />

        <!-- 格式刷：单击采样并单次应用，双击连续应用，Esc 取消 -->
        <el-button-group>
          <el-button
            size="small"
            :type="snapshot.formatPainterActive ? 'primary' : 'default'"
            title="格式刷：选中文本后单击采样格式，再选中目标文本应用；双击连续应用，Esc 取消"
            @click="onFormatPainterClick"
            @dblclick="onFormatPainterDoubleClick"
          >
            格式刷
          </el-button>
        </el-button-group>
        <span v-if="snapshot.formatPainterActive" class="format-painter-hint">
          已采样格式，选中目标文本即应用（Esc 取消）
        </span>

        <el-button-group>
          <el-button size="small" @click="exec((chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))">表格</el-button>
          <el-button size="small" @click="exec((chain) => chain.clearNodes().unsetAllMarks())">清除格式</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 编辑区 -->
    <EditorContent v-if="editor" :editor="editor" class="tiptap-content" />

    <!-- 选中文本的气泡菜单 -->
    <EditorBubbleMenu v-if="editor" :editor="editor" :snapshot="snapshot" />

    <!-- 表格浮动工具栏 -->
    <EditorTableMenu v-if="editor" :editor="editor" :readonly="readonlyModel" />

    <!-- 斜杠命令菜单（teleport 到 body） -->
    <EditorSlashMenu v-if="editor" ref="slashMenuRef" :editor="editor" />

    <!-- 底部：字数统计 / 只读 / 输出格式 -->
    <div class="tiptap-footer">
      <span class="char-count">字数：{{ snapshot.characters }}</span>
      <div class="footer-controls">
        <el-switch v-model="readonlyModel" active-text="只读" />
        <el-radio-group v-model="outputType" size="small">
          <el-radio-button value="html">HTML</el-radio-button>
          <el-radio-button value="json">JSON</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 内容输出 -->
    <div v-if="outputContent" class="tiptap-output">
      <pre>{{ outputContent }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * TiptapEditor - 基于 TipTap 的富文本编辑器（Element Plus 工具栏）
 * @description 参考 hlms-bi-front 的 TiptapProEditor 基础版实现：
 * 命令执行 / 状态检查抽成 utils，扩展统一在 extensions.ts 配置
 */
import { computed, nextTick, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { ArrowDown, Check } from '@element-plus/icons-vue';
import { buildExtensions } from './extensions';
import { createCommandRunner, executeCommand } from './utils/editorCommands';
import { createStateCheckers, getCurrentParagraphStyle, getCurrentTextAlign } from './utils/editorState';
import type { CommandBuilder } from './utils/editorCommands';
import EditorBubbleMenu from './EditorBubbleMenu.vue';
import EditorTableMenu from './EditorTableMenu.vue';
import EditorSlashMenu from './EditorSlashMenu.vue';

interface EditorSnapshot {
  html: string;
  json: JSONContent;
  characters: number;
  paragraphStyle: string;
  align: 'left' | 'center' | 'right' | 'justify';
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  textColor: string;
  highlightColor: string;
  linkHref: string;
  /** 格式刷是否激活（采样后等待应用） */
  formatPainterActive: boolean;
}

interface ChangePayload {
  html: string;
  json: JSONContent;
  characters: number;
}

const props = withDefaults(
  defineProps<{
    /** HTML 内容，支持 v-model */
    modelValue?: string;
    /** 占位提示文案 */
    placeholder?: string;
    /** 是否只读 */
    readonly?: boolean;
    /** 编辑区最小高度，数字按 px 处理 */
    minHeight?: string | number;
  }>(),
  {
    modelValue: '',
    placeholder: '开始编辑你的文档...',
    readonly: false,
    minHeight: 240,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', payload: ChangePayload): void;
}>();

const DEFAULT_CONTENT = `<h2>TipTap 基础用法演示</h2>
<p>支持 <strong>加粗</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>行内代码</code>、<span style="color: #c00000">文字颜色</span> 与 <mark style="background-color: #ffff00">背景高亮</mark>。</p>
<ul><li><p>无序列表</p></li><li><p>无序列表</p></li></ul>
<ol><li><p>有序列表</p></li></ol>
<ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked="true"><span></span></label><div><p>已完成的任务</p></div></li><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>待完成的任务</p></div></li></ul>
<blockquote><p>引用块：内容可输出为 HTML 或 JSON。</p></blockquote>
<pre><code>const editor = useEditor({ extensions: [StarterKit] })</code></pre>`;

const presetColors = [
  '#000000', '#434343', '#666666', '#999999', '#c0c0c0', '#ffffff',
  '#c00000', '#ff0000', '#ff6600', '#ffc000', '#ffff00', '#92d050',
  '#00b050', '#00b0f0', '#0070c0', '#7030a0',
];

const headingOptions = [
  { value: 'paragraph', label: '正文' },
  { value: 'h1', label: '标题 1' },
  { value: 'h2', label: '标题 2' },
  { value: 'h3', label: '标题 3' },
];

const alignOptions = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
  { value: 'justify', label: '两端对齐' },
];

const fontFamilyOptions = [
  { value: '', label: '默认字体' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'KaiTi', label: '楷体' },
  { value: '"Microsoft YaHei"', label: '微软雅黑' },
  { value: 'Arial', label: 'Arial' },
  { value: '"Times New Roman"', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
];

const fontSizeOptions = [
  { value: '', label: '默认字号' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
];

const lineHeightOptions = [
  { value: '1.0', label: '1.0' },
  { value: '1.5', label: '1.5' },
  { value: '1.75', label: '1.75' },
  { value: '2.0', label: '2.0' },
  { value: '2.5', label: '2.5' },
  { value: '3.0', label: '3.0' },
];

// 斜杠命令菜单实例（扩展回调经它驱动显隐）
const slashMenuRef = ref<InstanceType<typeof EditorSlashMenu>>();

// 快照：每次事务后重建，驱动工具栏状态 / 输出面板刷新
const snapshot = ref<EditorSnapshot>({
  html: '',
  json: {},
  characters: 0,
  paragraphStyle: 'paragraph',
  align: 'left',
  fontFamily: '',
  fontSize: '',
  lineHeight: '1.5',
  textColor: '',
  highlightColor: '',
  linkHref: '',
  formatPainterActive: false,
});

const refreshSnapshot = (ed: Ref<Editor | null | undefined>) => {
  const instance = ed.value;
  if (!instance) return;

  const textStyleAttrs = instance.getAttributes('textStyle') as {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  const highlightAttrs = instance.getAttributes('highlight') as { color?: string };
  const linkAttrs = instance.getAttributes('link') as { href?: string };
  const paragraphAttrs = instance.getAttributes('paragraph') as { lineHeight?: string };
  const headingAttrs = instance.getAttributes('heading') as { lineHeight?: string };
  const characterCount = instance.storage.characterCount as { characters?: () => number } | undefined;
  const formatPainterStorage = instance.storage as { formatPainter?: { isActive?: boolean } };

  snapshot.value = {
    html: instance.getHTML(),
    json: instance.getJSON(),
    characters: characterCount?.characters?.() ?? 0,
    paragraphStyle: getCurrentParagraphStyle(ed),
    align: getCurrentTextAlign(ed),
    fontFamily: fontFamilyOptions.find((option) => option.value === textStyleAttrs.fontFamily)?.value ?? '',
    fontSize: fontSizeOptions.find((option) => option.value === textStyleAttrs.fontSize)?.value ?? '',
    lineHeight:
      lineHeightOptions.find((option) => option.value === (paragraphAttrs.lineHeight ?? headingAttrs.lineHeight))
        ?.value ?? '',
    textColor: textStyleAttrs.color ?? '',
    highlightColor: highlightAttrs.color ?? '',
    linkHref: linkAttrs.href ?? '',
    formatPainterActive: formatPainterStorage.formatPainter?.isActive ?? false,
  };
};

// ===== 编辑器实例 =====
const editor = useEditor({
  extensions: buildExtensions({
    placeholder: props.placeholder,
    slashCommand: {
      onActivate: (state) => slashMenuRef.value?.activate(state),
      onDeactivate: () => slashMenuRef.value?.hide(),
      onQueryChange: (query) => slashMenuRef.value?.updateQuery(query),
    },
  }),
  content: props.modelValue || DEFAULT_CONTENT,
  // 构造期间 ref 尚未赋值，下一帧补齐快照
  onCreate: () => nextTick(() => refreshSnapshot(editor)),
  onUpdate: () => {
    refreshSnapshot(editor);
    const instance = editor.value;
    if (!instance) return;
    emit('update:modelValue', instance.getHTML());
    emit('change', {
      html: instance.getHTML(),
      json: instance.getJSON(),
      characters: snapshot.value.characters,
    });
  },
  // 选区变化同样触发，用于刷新工具栏激活态
  onTransaction: () => refreshSnapshot(editor),
});

// ===== 命令执行 / 状态检查 =====
const run = createCommandRunner(editor);
const { isActive } = createStateCheckers(editor);

const exec = (fn: CommandBuilder) => run(fn)();
const execUndo = () => exec((chain) => chain.undo());
const execRedo = () => exec((chain) => chain.redo());

const textFormats = computed(() => [
  { name: 'bold', label: '<b>B</b>', title: '加粗', active: isActive('bold'), action: () => exec((chain) => chain.toggleBold()) },
  { name: 'italic', label: '<i>I</i>', title: '斜体', active: isActive('italic'), action: () => exec((chain) => chain.toggleItalic()) },
  { name: 'underline', label: '<u>U</u>', title: '下划线', active: isActive('underline'), action: () => exec((chain) => chain.toggleUnderline()) },
  { name: 'strike', label: '<s>S</s>', title: '删除线', active: isActive('strike'), action: () => exec((chain) => chain.toggleStrike()) },
  { name: 'code', label: '&lt;/&gt;', title: '行内代码', active: isActive('code'), action: () => exec((chain) => chain.toggleCode()) },
]);

// ===== 标题 / 对齐 / 字体 =====
const currentHeadingLabel = computed(
  () => headingOptions.find((option) => option.value === snapshot.value.paragraphStyle)?.label ?? '正文',
);
const currentAlignLabel = computed(
  () => alignOptions.find((option) => option.value === snapshot.value.align)?.label ?? '左对齐',
);

/** 切换段落样式（参考 hlms：切标题时清理 textStyle 并还原选区） */
const onHeadingChange = (value: string) => {
  const instance = editor.value;
  if (!instance) return;
  const { from, to } = instance.state.selection;

  if (value === 'paragraph') {
    instance.chain().setParagraph().setTextSelection({ from, to }).run();
    return;
  }

  const level = Number(value.replace(/^h/, '')) as 1 | 2 | 3;
  if (![1, 2, 3].includes(level)) return;

  const { $from } = instance.state.selection;
  const start = $from.start($from.depth);
  const end = $from.end($from.depth);

  instance
    .chain()
    .setHeading({ level })
    .setTextSelection({ from: start, to: end })
    .unsetMark('textStyle')
    .setTextSelection({ from, to })
    .run();
}

const onAlignChange = (value: 'left' | 'center' | 'right' | 'justify') => {
  exec((chain) => chain.setTextAlign(value));
}

const onFontFamilyChange = (value: string) => {
  if (value) {
    exec((chain) => chain.setFontFamily(value));
  } else {
    exec((chain) => chain.unsetFontFamily());
  }
}

const onFontSizeChange = (value: string) => {
  if (value) {
    exec((chain) => chain.setFontSize(value));
  } else {
    exec((chain) => chain.unsetFontSize());
  }
}

const onLineHeightChange = (value: string) => {
  exec((chain) => chain.setLineHeight(value));
}

// ===== 格式刷 =====
/** 读取格式刷激活态（扩展 storage） */
const isFormatPainterActive = (): boolean => {
  const instance = editor.value;
  if (!instance) return false;
  const storage = instance.storage as { formatPainter?: { isActive?: boolean } };
  return storage.formatPainter?.isActive ?? false;
}

/** 单击：激活单次模式 / 取消 */
const onFormatPainterClick = () => {
  const instance = editor.value;
  if (!instance) return;
  if (isFormatPainterActive()) {
    exec((chain) => chain.cancelFormatPainting());
    return;
  }
  const ok = executeCommand(editor, (chain) => chain.startFormatPainting());
  if (!ok) {
    ElMessage.warning('请先选中一段文本，再单击格式刷采样');
  }
}

/** 双击：激活连续应用模式 / 取消 */
const onFormatPainterDoubleClick = () => {
  const instance = editor.value;
  if (!instance) return;
  if (isFormatPainterActive()) {
    exec((chain) => chain.cancelFormatPainting());
    return;
  }
  const ok = executeCommand(editor, (chain) => chain.startFormatPainting(2));
  if (!ok) {
    ElMessage.warning('请先选中一段文本，再双击格式刷采样');
  }
}

// ===== 颜色 =====
const textColorVisible = ref(false);
const highlightVisible = ref(false);

const chooseTextColor = (color: string) => {
  exec((chain) => chain.setColor(color));
  textColorVisible.value = false;
}

const onTextColorPickerChange = (color: string | null) => {
  if (color) exec((chain) => chain.setColor(color));
}

const clearTextColor = () => {
  exec((chain) => chain.unsetColor());
  textColorVisible.value = false;
}

const chooseHighlightColor = (color: string) => {
  exec((chain) => chain.setHighlight({ color }));
  highlightVisible.value = false;
}

const onHighlightPickerChange = (color: string | null) => {
  if (color) exec((chain) => chain.setHighlight({ color }));
}

const clearHighlight = () => {
  exec((chain) => chain.unsetHighlight());
  highlightVisible.value = false;
}

// ===== 链接 =====
const linkVisible = ref(false);
const linkUrl = ref('');

const openLinkPopover = () => {
  linkUrl.value = snapshot.value.linkHref;
  linkVisible.value = true;
}

const applyLink = () => {
  if (!linkUrl.value) return;
  exec((chain) => chain.setLink({ href: linkUrl.value }));
  linkVisible.value = false;
}

const removeLink = () => {
  exec((chain) => chain.unsetLink());
  linkVisible.value = false;
}

// ===== 图片 =====
const imageVisible = ref(false);
const imageUrl = ref('');
const imageFileInput = ref<HTMLInputElement>();

const applyImageUrl = () => {
  if (!imageUrl.value) return;
  exec((chain) => chain.setImage({ src: imageUrl.value }));
  imageUrl.value = '';
  imageVisible.value = false;
}

const pickImageFile = () => {
  imageFileInput.value?.click();
}

const onImageFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result;
    if (typeof src === 'string') exec((chain) => chain.setImage({ src }));
  };
  reader.readAsDataURL(file);
  imageVisible.value = false;
}

// ===== 只读 / 输出 =====
const readonlyModel = ref(props.readonly);
watch(readonlyModel, (value) => {
  editor.value?.setEditable(!value);
});
watch(
  () => props.readonly,
  (value) => {
    readonlyModel.value = value;
  },
);

const outputType = ref<'html' | 'json'>('html');
const outputContent = computed(() => {
  const { html, json } = snapshot.value;
  return outputType.value === 'html' ? html : JSON.stringify(json, null, 2);
});

const minHeightStyle = computed(() =>
  typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
);

// ===== 外部内容同步（避免与 onUpdate 形成回环）=====
watch(
  () => props.modelValue,
  (value) => {
    const instance = editor.value;
    if (!instance || value === undefined) return;
    if (value !== instance.getHTML()) {
      instance.commands.setContent(value || '<p></p>', { emitUpdate: false });
      refreshSnapshot(editor);
    }
  },
);
</script>

<style lang="less" scoped>
.tiptap-editor {
  border: 1px solid #e4e7ed;
  border-radius: var(--ai-radius-sm);
  background: #fff;
}

.tiptap-toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.format-painter-hint {
  font-size: 12px;
  line-height: 1;
  color: #e6a23c;
  white-space: nowrap;
}

.tiptap-content {
  :deep(.ProseMirror) {
    min-height: var(--editor-min-height, 240px);
    padding: 12px;
    outline: none;
    line-height: 1.8;
    font-size: 14px;
    color: #303133;

    > * + * {
      margin-top: 8px;
    }

    h1,
    h2,
    h3 {
      font-weight: 600;
      line-height: 1.4;
    }

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 20px;
    }

    h3 {
      font-size: 17px;
    }

    ul,
    ol {
      padding-left: 24px;
    }

    ul[data-type='taskList'] {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: flex-start;
        gap: 8px;

        > label {
          margin-top: 5px;

          input {
            margin: 0;
          }
        }

        > div {
          flex: 1;
        }
      }
    }

    blockquote {
      border-left: 3px solid #dcdfe6;
      padding-left: 12px;
      color: #606266;
    }

    /* 格式刷激活时的光标提示（类名由 formatPainter 扩展挂在 view.dom 上） */
    &.cursor-format-painter {
      cursor: crosshair;
    }

    pre {
      background: #1e1e2e;
      color: #cdd6f4;
      border-radius: var(--ai-radius-sm);
      padding: 12px;
      font-size: 12.5px;
      line-height: 1.6;
      overflow-x: auto;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }

    code {
      background: #f0f2f5;
      border-radius: var(--ai-radius-xs);
      padding: 2px 5px;
      font-size: 0.92em;
      font-family: Consolas, Monaco, 'Courier New', monospace;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        border: 1px solid #d0d5dd;
        padding: 6px 10px;
        vertical-align: top;
        position: relative;
        min-width: 68px;
      }

      th {
        background: #f5f7fa;
        font-weight: 600;
      }

      .selectedCell {
        background: rgba(64, 158, 255, 0.12);
      }
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: var(--ai-radius-xs);
    }

    .ProseMirror-selectednode {
      outline: 2px solid #409eff;
    }

    hr {
      border: none;
      border-top: 2px solid #e4e7ed;
      margin: 12px 0;
    }

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #a8abb2;
      float: left;
      height: 0;
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -1px;
      width: 4px;
      background-color: #409eff;
      pointer-events: none;
    }

    .resize-cursor {
      cursor: col-resize;
    }
  }
}

.tiptap-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #909399;
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tiptap-output {
  border-top: 1px solid #e4e7ed;
  background: #f5f7fa;
  padding: 12px;
  max-height: 160px;
  overflow: auto;

  pre {
    margin: 0;
    font-size: 12px;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    color: #606266;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.color-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 20px);
  gap: 6px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  padding: 0;
}

.color-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-button-label {
  display: inline-block;
  border-bottom: 3px solid;
  padding: 0 2px;
  line-height: 1.2;

  &.is-highlight {
    border-bottom: none;
    border-radius: 2px;
    padding: 0 4px;
  }
}

.link-panel,
.image-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.hidden-file-input {
  display: none;
}

.is-active-option {
  color: var(--el-color-primary);
  font-weight: 600;
}

.option-check {
  margin-right: 4px;
}
</style>
