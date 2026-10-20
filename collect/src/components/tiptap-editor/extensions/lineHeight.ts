/**
 * LineHeight 行高扩展
 * @description 参考 hlms-bi-front 的同名扩展：TipTap 官方无行高能力，
 * 通过向 paragraph / heading 挂 lineHeight 全局属性实现
 */
import { Extension } from '@tiptap/vue-3';

export interface LineHeightOptions {
  /** 生效的节点类型 */
  types: string[];
  /** 默认行高 */
  defaultLineHeight: string;
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: '1.5',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) =>
          this.options.types.every((type) => commands.updateAttributes(type, { lineHeight })),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types.every((type) => commands.updateAttributes(type, { lineHeight: null })),
    };
  },
});

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    lineHeight: {
      /** 设置行高（如 '1.5' / '2'） */
      setLineHeight: (lineHeight: string) => ReturnType;
      /** 取消行高 */
      unsetLineHeight: () => ReturnType;
    };
  }
}
