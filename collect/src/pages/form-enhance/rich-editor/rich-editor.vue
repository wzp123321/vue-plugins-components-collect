<template>
  <div class="rich-editor-page">
    <h5>富文本编辑器</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      演示三种富文本编辑器方案：
      <strong>原生 contenteditable</strong>
      （轻量，execCommand 已废弃）、
      <strong>WangEditor</strong>
      （功能完整，代码示意）、
      <strong>TipTap</strong>
      （下方为真实可交互演示，底层 ProseMirror；覆盖基础用法与进阶用法：
      字号 / 行高 / 格式刷 / 粘贴 Word 净化 / 粘贴图片 / 气泡菜单 / 斜杠命令 / 表格浮动工具栏）。
    </el-alert>

    <el-row :gutter="20">
      <!-- 原生 contenteditable 编辑器 -->
      <el-col :span="12">
        <el-card>
          <template #header>① 原生 contenteditable 富文本</template>
          <div class="toolbar">
            <el-button-group size="small">
              <el-button @click="execCmd('bold')"><b>B</b></el-button>
              <el-button @click="execCmd('italic')"><i>I</i></el-button>
              <el-button @click="execCmd('underline')"><u>U</u></el-button>
              <el-button @click="execCmd('strikeThrough')"><s>S</s></el-button>
            </el-button-group>
            <el-button-group size="small" style="margin-left: 8px">
              <el-button @click="execCmd('justifyLeft')">左</el-button>
              <el-button @click="execCmd('justifyCenter')">中</el-button>
              <el-button @click="execCmd('justifyRight')">右</el-button>
            </el-button-group>
            <el-color-picker v-model="fontColor" size="small" style="margin-left: 8px" @change="setFontColor" />
            <el-select v-model="fontSize" size="small" style="width: 80px; margin-left: 8px" @change="setFontSize">
              <el-option v-for="s in fontSizes" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
          <div
            ref="editorRef"
            class="editor-content"
            contenteditable="true"
            @input="onEditorInput"
            @mouseup="saveSelection"
          ></div>
          <div class="editor-footer">
            <span>字符数：{{ charCount }}</span>
            <el-button size="small" @click="showHtml = !showHtml">{{ showHtml ? '隐藏' : '查看' }} HTML</el-button>
          </div>
          <div v-if="showHtml" class="html-preview">{{ editorHtml }}</div>
        </el-card>
      </el-col>

      <!-- WangEditor 安装指南 + 代码示例 -->
      <el-col :span="12">
        <el-card>
          <template #header>② WangEditor（主流富文本方案）</template>
          <div class="install-guide">
            <p class="guide-title">📦 安装</p>
            <pre class="code-block">pnpm add @wangeditor/editor @wangeditor/editor-for-vue</pre>

            <p class="guide-title" style="margin-top: 16px">💻 Vue3 使用方式</p>
            <pre class="code-block">{{ wangEditorCode }}</pre>

            <p class="guide-title" style="margin-top: 16px">🔧 常用配置</p>
            <pre class="code-block">{{ wangEditorConfig }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- TipTap 真实可交互演示 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>③ TipTap 富文本编辑器（真实可交互）</template>
          <TiptapEditor v-model="tiptapHtml" @change="onTiptapChange" />
          <div class="tiptap-status">
            最近一次 change 事件：字数 {{ tiptapChange.characters }} · HTML 长度 {{ tiptapChange.htmlLength }}
          </div>
          <div class="install-guide" style="margin-top: 16px">
            <p class="guide-title">📦 安装</p>
            <pre class="code-block">{{ tiptapInstall }}</pre>

            <p class="guide-title" style="margin-top: 16px">💻 Vue3 使用方式</p>
            <pre class="code-block">{{ tiptapCode }}</pre>

            <p class="guide-title" style="margin-top: 16px">🚀 进阶用法（组件内置，无需额外依赖）</p>
            <pre class="code-block">{{ tiptapAdvancedCode }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { TiptapEditor } from '@/components/tiptap-editor';

defineOptions({ name: 'RichEditor' });

const editorRef = ref<HTMLDivElement>();
const editorHtml = ref('');
const charCount = ref(0);
const showHtml = ref(false);
const fontColor = ref('#000000');
const fontSize = ref('14px');
const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

let savedRange: Range | null = null;

const saveSelection = () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0);
  }
};

const restoreSelection = () => {
  if (savedRange) {
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
  }
};

const execCmd = (command: string, value?: string) => {
  editorRef.value?.focus();
  document.execCommand(command, false, value);
};

const setFontColor = (color: any) => {
  restoreSelection();
  execCmd('foreColor', color);
};

const setFontSize = (size: string) => {
  restoreSelection();
  // execCommand fontSize 只支持 1-7，需要用其他方法
  document.execCommand('styleWithCSS', false, 'true');
  document.execCommand('fontSize', false, '7');
  // 替换掉生成的 font 标签 size 属性
  const fontEls = editorRef.value?.querySelectorAll('font[size="7"]');
  fontEls?.forEach((el) => {
    (el as HTMLElement).style.fontSize = size;
    el.removeAttribute('size');
  });
};

const onEditorInput = () => {
  editorHtml.value = editorRef.value?.innerHTML ?? '';
  charCount.value = editorRef.value?.innerText.length ?? 0;
};

// 初始化内容
nextTick(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = '<p>在这里输入内容，使用上方工具栏进行格式化...</p>';
    onEditorInput();
  }
});

const wangEditorCode = `<template>
  <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" />
  <Editor
    v-model="valueHtml"
    :defaultConfig="editorConfig"
    @onCreated="handleCreated"
  />
</template>

<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { ref, shallowRef, onBeforeUnmount } from 'vue'

const editorRef = shallowRef()  // 必须用 shallowRef
const valueHtml = ref('<p>初始内容</p>')

const handleCreated = (editor) => {
  editorRef.value = editor
}

// 组件销毁时销毁编辑器实例
onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
<\/script>`;

const wangEditorConfig = `const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    // 图片上传配置
    uploadImage: {
      server: '/api/upload',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024,  // 5MB
      onSuccess(file, res) { ... },
      onFailed(file, res) { ... },
    }
  }
}`;

const tiptapCode = `// 组件位置：src/components/tiptap-editor（可直接复用）
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { buildExtensions } from '@/components/tiptap-editor'

const editor = useEditor({
  content: '<p>Hello TipTap!</p>',
  extensions: buildExtensions({ placeholder: '开始编辑你的文档...' }),
  onUpdate: ({ editor }) => {
    editor.getHTML()  // HTML 输出
    editor.getJSON()  // JSON 输出（结构化存储推荐）
  },
})

// 工具栏命令统一走链式 API，如：editor.chain().focus().toggleBold().run()
// 查询激活态：editor.isActive('bold') / editor.isActive('heading', { level: 1 })`;

const tiptapAdvancedCode = `// 1) 行高 / 字号：自定义扩展向节点挂全局属性
editor.chain().focus().setLineHeight('2.0').run()
editor.chain().focus().setFontSize('18px').run()

// 2) 粘贴 Word 净化：transformPastedHTML 清理 o:p / 注释 / Mso 类名 / mso-* 样式
// 3) 粘贴图片：纯图片走 base64 插入；图文混排替换 file://；可传 uploadImage 走服务端
buildExtensions({ uploadImage: (file) => uploadToServer(file) })

// 4) 格式刷：采样当前选区格式 → 选中目标文本自动应用（Esc 取消）
editor.chain().focus().startFormatPainting().run()        // 单次
editor.chain().focus().startFormatPainting(2).run()       // 连续
editor.commands.applyFormat() / cancelFormatPainting()

// 5) 交互组件：EditorBubbleMenu（选中气泡）/ EditorSlashMenu（斜杠命令）/
//    EditorTableMenu（表格浮动工具栏），均已内置在 TiptapEditor 中`;

const tiptapInstall = `# 核心
pnpm add @tiptap/vue-3 @tiptap/starter-kit @tiptap/pm

# 基础扩展（当前组件已装）
pnpm add @tiptap/extension-placeholder @tiptap/extension-text-align \\
  @tiptap/extension-underline @tiptap/extension-color @tiptap/extension-text-style \\
  @tiptap/extension-highlight @tiptap/extension-link @tiptap/extension-image \\
  @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell \\
  @tiptap/extension-table-header @tiptap/extension-task-list @tiptap/extension-task-item \\
  @tiptap/extension-character-count @tiptap/extension-subscript @tiptap/extension-superscript \\
  @tiptap/extension-font-family

# 菜单组件依赖（BubbleMenu / 斜杠命令定位）
pnpm add @tiptap/extension-bubble-menu @tiptap/extension-floating-menu tippy.js

# 行高 / 粘贴 Word 净化 / 粘贴图片 / 格式刷为组件内自定义扩展，无需额外安装`;

// ===== TipTap 演示状态 =====
const tiptapHtml = ref('');
const tiptapChange = ref({ characters: 0, htmlLength: 0 });

const onTiptapChange = (payload: { html: string; json: unknown; characters: number }) => {
  tiptapChange.value = { characters: payload.characters, htmlLength: payload.html.length };
};
</script>

<style lang="less" scoped>
.rich-editor-page {
  padding: 20px;
  overflow-y: auto;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background: #fafafa;
}

.editor-content {
  min-height: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 0 0 6px 6px;
  padding: 12px;
  outline: none;
  line-height: 1.8;
  font-size: 14px;

  &:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  color: #999;
}

.html-preview {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  font-family: monospace;
  color: #666;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
}

.install-guide {
  .guide-title {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 6px;
    color: #303133;
  }
}

.tiptap-status {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
