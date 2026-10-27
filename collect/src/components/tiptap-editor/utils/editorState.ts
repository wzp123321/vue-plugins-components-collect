/**
 * 编辑器状态检查工具
 * @description 参考 hlms-bi-front 的 editorState.ts：统一封装 isActive / 段落样式 / 对齐 等查询
 */
import type { Ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';

type AttributeValue = string | number | boolean | null | undefined;

export interface StateCheckers {
  /** 检查节点/标记是否激活 */
  isActive: (name: string, attributes?: Record<string, AttributeValue>) => boolean;
  /** 检查标题级别是否激活 */
  isHeadingActive: (level: number) => boolean;
  /** 检查对齐方式是否激活 */
  isActiveAlign: (value: 'left' | 'center' | 'right' | 'justify') => boolean;
  /** 检查命令是否可执行 */
  canExecute: (command: string) => boolean;
}

/**
 * 创建状态检查器集合
 * @example
 * const { isActive, isHeadingActive } = createStateCheckers(editor)
 */
export const createStateCheckers = (editor: Ref<Editor | null | undefined>): StateCheckers => ({
  isActive: (name, attributes) => {
    const instance = editor.value;
    if (!instance) return false;
    return attributes ? instance.isActive(name, attributes) : instance.isActive(name);
  },

  isHeadingActive: (level) => {
    const instance = editor.value;
    if (!instance) return false;
    return instance.isActive('heading', { level });
  },

  isActiveAlign: (value) => {
    const instance = editor.value;
    if (!instance) return false;
    return instance.isActive({ textAlign: value });
  },

  canExecute: (command) => {
    const instance = editor.value;
    if (!instance) return false;
    const canObj = instance.can() as unknown as Record<
      string,
      ((...args: unknown[]) => boolean) | undefined
    >;
    const fn = canObj[command];
    return typeof fn === 'function' ? fn() : false;
  },
});

/**
 * 获取当前段落样式
 * @returns 'paragraph' | 'h1' | 'h2' | 'h3'
 */
export const getCurrentParagraphStyle = (editor: Ref<Editor | null | undefined>): string => {
  const instance = editor.value;
  if (!instance) return 'paragraph';
  for (let level = 1; level <= 3; level += 1) {
    if (instance.isActive('heading', { level })) return `h${level}`;
  }
  return 'paragraph';
}

/**
 * 获取当前文本对齐方式
 */
export const getCurrentTextAlign = (
  editor: Ref<Editor | null | undefined>,
): 'left' | 'center' | 'right' | 'justify' => {
  const instance = editor.value;
  if (!instance) return 'left';
  const alignments: Array<'left' | 'center' | 'right' | 'justify'> = [
    'left',
    'center',
    'right',
    'justify',
  ];
  const currentAlign = alignments.find((align) => instance.isActive({ textAlign: align }));
  return currentAlign ?? 'left';
}
