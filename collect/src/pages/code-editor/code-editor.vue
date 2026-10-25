<template>
  <div class="editor-page">
    <header class="editor-page__head">
      <h3 class="editor-page__title">代码编辑器（CodeMirror 6）</h3>
      <p class="editor-page__desc">
        配置/SQL/脚本编辑的标配：按需装语言包，编辑器本体约 200KB，比 Monaco 轻一个量级。
      </p>
    </header>

    <div class="editor-page__layout">
      <div class="editor-pane">
        <div class="editor-pane__bar">
          <span class="editor-pane__lang">JavaScript</span>
          <button class="editor-pane__btn" @click="showValue">读取内容</button>
          <button class="editor-pane__btn" @click="insertSnippet">插入片段</button>
        </div>
        <div ref="editorEl" class="editor-pane__host"></div>
      </div>

      <div class="editor-side">
        <div class="editor-side__stat">
          <span>字符数</span>
          <strong>{{ charCount }}</strong>
        </div>
        <div class="editor-side__stat">
          <span>行数</span>
          <strong>{{ lineCount }}</strong>
        </div>
        <pre v-if="output" class="editor-side__output">{{ output }}</pre>
        <ul class="editor-side__list">
          <li>扩展即插件：语言包、主题、行号、搜索都是 EditorExtension，按需拼装</li>
          <li>updateListener 拿文档变化，做字数统计/实时校验/保存草稿</li>
          <li>SQL 编辑场景换 @codemirror/lang-sql，配置 schema 还能补全表名字段</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

defineOptions({ name: 'CodeEditorDemo' });

const editorEl = ref<HTMLElement | null>(null);
const charCount = ref(0);
const lineCount = ref(0);
const output = ref('');

let view: EditorView | null = null;

const SNIPPET = `\n// 新片段 ${new Date().toLocaleTimeString()}\nconsole.log('hello editor');\n`;

onMounted(() => {
  if (!editorEl.value) return;
  view = new EditorView({
    parent: editorEl.value,
    doc: `// 在这里编辑 JS\nfunction greet(name) {\n  return \`你好，\${name}！\`;\n}\n\ngreet('CodeMirror 6');\n`,
    extensions: [
      basicSetup,
      javascript(),
      EditorView.theme({
        '&': { fontSize: '13px', backgroundColor: 'transparent', height: '100%' },
        '.cm-gutters': { border: 'none', background: 'transparent' },
        '.cm-activeLine': { background: 'rgba(124, 92, 255, 0.08)' },
      }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        charCount.value = update.state.doc.length;
        lineCount.value = update.state.doc.lines;
      }),
    ],
  });
  charCount.value = view.state.doc.length;
  lineCount.value = view.state.doc.lines;
});

const showValue = () => {
  output.value = view?.state.doc.toString() ?? '';
}

const insertSnippet = () => {
  if (!view) return;
  const pos = view.state.doc.length;
  view.dispatch({
    changes: { from: pos, insert: SNIPPET },
    selection: { anchor: pos + SNIPPET.length },
  });
  view.focus();
}

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});
</script>

<style lang="less" scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 460px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
  }

  &__layout {
    display: flex;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }
}

.editor-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);
  overflow: hidden;

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--ai-hairline);
  }

  &__lang {
    margin-right: auto;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 11px;
  }

  &__btn {
    height: 26px;
    padding: 0 12px;
    border: 1px solid var(--ai-border);
    border-radius: 7px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-dim);
    font-size: 11.5px;
    cursor: pointer;

    &:hover {
      color: var(--ai-text);
    }
  }

  &__host {
    flex: 1;
    min-height: 0;
    overflow: auto;

    :deep(.cm-editor) {
      height: 100%;
    }

    :deep(.cm-scroller) {
      font-family: var(--ai-font-mono) !important;
    }
  }
}

.editor-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;
  flex-shrink: 0;

  &__stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border: 1px solid var(--ai-hairline);
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface-raised);
    color: var(--ai-text-mute);
    font-size: 12px;

    strong {
      color: var(--ai-text);
      font-family: var(--ai-font-mono);
      font-size: 14px;
    }
  }

  &__output {
    margin: 0;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.8;
  }
}
</style>
