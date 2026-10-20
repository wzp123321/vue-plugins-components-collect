/**
 * FontSize 字号扩展
 * @description 参考 hlms-bi-front 的同名扩展：TipTap 官方无字号能力，
 * 通过向 textStyle 挂 fontSize 全局属性实现
 */
import { Extension } from '@tiptap/vue-3';

export interface FontSizeOptions {
  types: string[];
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    fontSize: {
      /** 设置字号 */
      setFontSize: (fontSize: string) => ReturnType;
      /** 取消字号 */
      unsetFontSize: () => ReturnType;
    };
  }
}
