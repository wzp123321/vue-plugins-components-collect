<template>
  <bubble-menu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100, placement: 'top', offset: [0, 10] }"
    :should-show="shouldShow"
    class="editor-bubble-menu"
  >
    <div class="bubble-toolbar">
      <el-button-group>
        <el-button
          v-for="format in textFormats"
          :key="format.name"
          size="small"
          :type="isActive(format.name) ? 'primary' : 'default'"
          :title="format.title"
          @click="format.action"
        >
          <span v-html="format.label" />
        </el-button>
      </el-button-group>

      <el-popover v-model:visible="textColorVisible" placement="bottom" :width="248">
        <template #reference>
          <el-button size="small" title="文字颜色">
            <span class="bubble-color-label" :style="{ borderBottomColor: snapshot.textColor || '#909399' }">A</span>
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

      <el-popover v-model:visible="linkVisible" placement="bottom" :width="260">
        <template #reference>
          <el-button size="small" :type="isActive('link') ? 'primary' : 'default'" title="链接">链接</el-button>
        </template>
        <div class="link-panel">
          <el-input v-model="linkUrl" size="small" placeholder="https://example.com" @keyup.enter="applyLink" />
          <div class="panel-actions">
            <el-button size="small" type="primary" @click="applyLink">确认</el-button>
            <el-button size="small" @click="removeLink">取消链接</el-button>
          </div>
        </div>
      </el-popover>
    </div>
  </bubble-menu>
</template>

<script lang="ts" setup>
/**
 * EditorBubbleMenu - 选中文本时弹出的格式气泡菜单
 * @description 参考 hlms 的 link-bubble，扩展为常用格式 + 颜色 + 链接
 */
import { computed, ref, watch } from 'vue';
import { BubbleMenu } from '@tiptap/vue-3/menus';
import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';
import type { Editor } from '@tiptap/vue-3';
import { createCommandRunner } from './utils/editorCommands';
import { createStateCheckers } from './utils/editorState';

const props = defineProps<{
  editor: Editor | null | undefined;
  /** 当前格式快照（由父组件随事务刷新） */
  snapshot: { textColor: string; linkHref: string };
}>();

const editor = computed(() => props.editor ?? null);
const run = createCommandRunner(editor);
const { isActive } = createStateCheckers(editor);

const exec = (fn: Parameters<typeof run>[0]) => run(fn)();

/** BubbleMenu 组件 shouldShow 回调的参数类型（editor 为 @tiptap/core 的 Editor，非 vue-3 子类） */
type ShouldShowProps = Parameters<NonNullable<BubbleMenuPluginProps['shouldShow']>>[0];

/** 仅在有文本选中时显示气泡菜单 */
const shouldShow = (bubbleProps: ShouldShowProps) => !bubbleProps.state.selection.empty;

const textFormats = [
  { name: 'bold', label: '<b>B</b>', title: '加粗', action: () => exec((chain) => chain.toggleBold()) },
  { name: 'italic', label: '<i>I</i>', title: '斜体', action: () => exec((chain) => chain.toggleItalic()) },
  { name: 'underline', label: '<u>U</u>', title: '下划线', action: () => exec((chain) => chain.toggleUnderline()) },
  { name: 'strike', label: '<s>S</s>', title: '删除线', action: () => exec((chain) => chain.toggleStrike()) },
  { name: 'code', label: '&lt;/&gt;', title: '行内代码', action: () => exec((chain) => chain.toggleCode()) },
];

const presetColors = [
  '#000000', '#434343', '#666666', '#999999', '#c0c0c0', '#ffffff',
  '#c00000', '#ff0000', '#ff6600', '#ffc000', '#ffff00', '#92d050',
  '#00b050', '#00b0f0', '#0070c0', '#7030a0',
];

// ===== 颜色 =====
const textColorVisible = ref(false);

function chooseTextColor(color: string) {
  exec((chain) => chain.setColor(color));
  textColorVisible.value = false;
}

function onTextColorPickerChange(color: string | null) {
  if (color) exec((chain) => chain.setColor(color));
}

function clearTextColor() {
  exec((chain) => chain.unsetColor());
  textColorVisible.value = false;
}

// ===== 链接 =====
const linkVisible = ref(false);
const linkUrl = ref('');

// 打开时回填当前链接地址
watch(linkVisible, (visible) => {
  if (visible) linkUrl.value = props.snapshot.linkHref;
});

function applyLink() {
  if (!linkUrl.value) return;
  exec((chain) => chain.setLink({ href: linkUrl.value }));
  linkVisible.value = false;
}

function removeLink() {
  exec((chain) => chain.unsetLink());
  linkVisible.value = false;
}
</script>

<style lang="less" scoped>
.editor-bubble-menu {
  z-index: 1002;
}

.bubble-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bubble-color-label {
  display: inline-block;
  border-bottom: 3px solid;
  padding: 0 2px;
  line-height: 1.2;
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

.link-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-actions {
  display: flex;
  gap: 8px;
}
</style>
