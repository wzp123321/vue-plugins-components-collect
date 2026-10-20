/**
 * FormatPainter 格式刷扩展
 * @description 参考 hlms-bi-front 的同名扩展（精简版，去掉协作检测与本地存储）：
 * 单击采样当前选区格式并进入单次应用模式，双击进入连续应用模式；
 * 激活后选中目标文本即自动应用，Esc 取消
 */
import { Extension } from '@tiptap/vue-3';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface FormatPainterFormats {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  color?: string | null;
  fontFamily?: string | null;
  fontSize?: string | null;
  highlight?: string | null;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | null;
  lineHeight?: string | null;
}

export interface FormatPainterStorage {
  /** 格式刷是否激活 */
  isActive: boolean;
  /** 是否为连续应用模式 */
  isContinuous: boolean;
  /** 采样的格式 */
  formats: FormatPainterFormats;
}

/**
 * 采样当前选区的格式样式
 * @description 提取选区的文本级格式（加粗/斜体/颜色等）与段落级格式（对齐/行高）
 */
export function sampleFormats(editor: {
  isActive: (name: string) => boolean;
  getAttributes: (name: string) => Record<string, unknown>;
}): FormatPainterFormats {
  const formats: FormatPainterFormats = {};

  formats.bold = editor.isActive('bold');
  formats.italic = editor.isActive('italic');
  formats.underline = editor.isActive('underline');
  formats.strike = editor.isActive('strike');
  formats.subscript = editor.isActive('subscript');
  formats.superscript = editor.isActive('superscript');

  const textStyleAttrs = editor.getAttributes('textStyle') as {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  formats.color = textStyleAttrs?.color ?? null;
  formats.fontFamily = textStyleAttrs?.fontFamily ?? null;
  formats.fontSize = textStyleAttrs?.fontSize ?? null;

  const highlightAttrs = editor.getAttributes('highlight') as { color?: string };
  formats.highlight = highlightAttrs?.color ?? null;

  // 对齐与行高可能存在于段落或标题上
  const paragraphAttrs = editor.getAttributes('paragraph') as {
    textAlign?: FormatPainterFormats['textAlign'];
    lineHeight?: string;
  };
  const headingAttrs = editor.getAttributes('heading') as {
    textAlign?: FormatPainterFormats['textAlign'];
    lineHeight?: string;
  };
  formats.textAlign = paragraphAttrs?.textAlign ?? headingAttrs?.textAlign ?? null;
  formats.lineHeight = paragraphAttrs?.lineHeight ?? headingAttrs?.lineHeight ?? null;

  return formats;
}

export const FormatPainter = Extension.create<Record<string, never>, FormatPainterStorage>({
  name: 'formatPainter',

  addStorage() {
    return {
      isActive: false,
      isContinuous: false,
      formats: {},
    } as FormatPainterStorage;
  },

  addCommands() {
    return {
      /**
       * 开启格式刷并采样当前选区格式
       * @param mode - 1 单次模式（默认），2 连续模式
       */
      startFormatPainting:
        (mode?: 1 | 2) =>
        ({ editor }) => {
          const sel = editor.state.selection;
          if (!sel || sel.empty) return false;

          const formats = sampleFormats(editor);
          this.storage.formats = formats;
          this.storage.isActive = true;
          this.storage.isContinuous = mode === 2;
          editor.view.dom.classList.add('cursor-format-painter');
          return true;
        },

      /** 开启格式刷连续应用模式 */
      startContinuousFormatPainting:
        () =>
        ({ editor }) => {
          const sel = editor.state.selection;
          if (!sel || sel.empty) return false;

          this.storage.formats = sampleFormats(editor);
          this.storage.isActive = true;
          this.storage.isContinuous = true;
          editor.view.dom.classList.add('cursor-format-painter');
          return true;
        },

      /** 将采样到的格式应用到当前选区 */
      applyFormat:
        () =>
        ({ editor }) => {
          if (!this.storage.isActive) return false;

          const sel = editor.state.selection;
          if (!sel || sel.empty) return false;

          const formats = this.storage.formats;
          if (!formats || Object.keys(formats).length === 0) return false;

          try {
            const chain = editor.chain().focus();

            if (formats.bold) chain.setMark('bold');
            else chain.unsetMark('bold');

            if (formats.italic) chain.setMark('italic');
            else chain.unsetMark('italic');

            if (formats.underline) chain.setMark('underline');
            else chain.unsetMark('underline');

            if (formats.strike) chain.setMark('strike');
            else chain.unsetMark('strike');

            // 上下标互斥，先清除再设置
            chain.unsetMark('subscript').unsetMark('superscript');
            if (formats.subscript) chain.setMark('subscript');
            else if (formats.superscript) chain.setMark('superscript');

            const textStyleAttrs: Record<string, string> = {};
            if (formats.color) textStyleAttrs.color = formats.color;
            if (formats.fontFamily) textStyleAttrs.fontFamily = formats.fontFamily;
            if (formats.fontSize) textStyleAttrs.fontSize = formats.fontSize;
            if (Object.keys(textStyleAttrs).length > 0) {
              chain.setMark('textStyle', textStyleAttrs);
            } else {
              chain.unsetMark('textStyle');
            }

            if (formats.highlight) chain.setHighlight({ color: formats.highlight });
            else chain.unsetHighlight();

            chain.run();

            // 段落级格式
            if (formats.textAlign) {
              editor.chain().focus().setTextAlign(formats.textAlign).run();
            }
            if (formats.lineHeight) {
              editor.chain().focus().setLineHeight(formats.lineHeight).run();
            }
          } catch {
            return false;
          }

          // 单次模式应用后即退出
          if (!this.storage.isContinuous) {
            this.storage.isActive = false;
            editor.view.dom.classList.remove('cursor-format-painter');
          }
          return true;
        },

      /** 取消格式刷状态并清除采样 */
      cancelFormatPainting:
        () =>
        ({ editor }) => {
          this.storage.isActive = false;
          this.storage.isContinuous = false;
          this.storage.formats = {};
          editor.view.dom.classList.remove('cursor-format-painter');
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const ext = this;
    return [
      new Plugin({
        key: new PluginKey('formatPainter'),
        props: {
          // Esc 退出格式刷
          handleKeyDown(_view, event: KeyboardEvent) {
            const storage = ext.storage as FormatPainterStorage;
            if (storage.isActive && event.key === 'Escape') {
              ext.editor?.commands.cancelFormatPainting();
              return true;
            }
            return false;
          },

          // 格式刷激活时，鼠标抬起后自动把格式应用到新选区
          handleDOMEvents: {
            mouseup: () => {
              const storage = ext.storage as FormatPainterStorage;
              if (storage.isActive && ext.editor) {
                requestAnimationFrame(() => {
                  if (!storage.isActive || !ext.editor) return;
                  try {
                    if (!ext.editor.state.selection.empty) {
                      ext.editor.commands.applyFormat();
                    }
                  } catch {
                    // ignore
                  }
                });
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    formatPainter: {
      /** 开启格式刷并采样当前选区格式，mode 1 单次 / 2 连续 */
      startFormatPainting: (mode?: 1 | 2) => ReturnType;
      /** 开启格式刷连续应用模式 */
      startContinuousFormatPainting: () => ReturnType;
      /** 将采样到的格式应用到当前选区 */
      applyFormat: () => ReturnType;
      /** 取消格式刷状态并清除采样 */
      cancelFormatPainting: () => ReturnType;
    };
  }
}
