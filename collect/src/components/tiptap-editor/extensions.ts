/**
 * TipTap 扩展配置
 * @description 参考 hlms-bi-front 的 coreExtensions.ts，收敛为「基础版」常用扩展：
 * StarterKit + 占位符 + 对齐 + 下划线 + 颜色/高亮 + 链接 + 图片 + 任务列表 + 表格 + 字数统计 等
 */
import type { AnyExtension } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from './extensions/fontSize';
import { SlashCommandExtension } from './extensions/slashCommand';
import type { SlashCommandOptions } from './extensions/slashCommand';

export interface BuildExtensionsOptions {
  /** 占位提示文案 */
  placeholder?: string;
  /** 是否禁用历史记录扩展（协作模式下手动管理历史时传 true），默认 false */
  disableHistory?: boolean;
  /** 斜杠命令菜单回调 */
  slashCommand?: SlashCommandOptions;
}

/**
 * 构建编辑器扩展列表
 * @description StarterKit(v3) 已内置 link / underline，这里关闭后用带配置的版本替换，
 * 保证链接新窗口打开、下划线可被工具栏切换
 */
export function buildExtensions(options: BuildExtensionsOptions = {}): AnyExtension[] {
  const { placeholder = '开始编辑你的文档...', disableHistory = false, slashCommand } = options;

  const starterKitConfig: Record<string, unknown> = {
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
  };
  if (disableHistory) {
    starterKitConfig.history = false;
  }

  return [
    StarterKit.configure(starterKitConfig),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    Color,
    TextStyle,
    Highlight.configure({ multicolor: true }),
    Image.configure({ inline: true, allowBase64: true }),
    Link.configure({
      openOnClick: true,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    FontFamily,
    FontSize,
    Subscript,
    Superscript,
    CharacterCount,
    SlashCommandExtension.configure(slashCommand ?? {}),
  ];
}
