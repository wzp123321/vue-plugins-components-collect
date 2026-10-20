/**
 * tiptap-editor 组件统一出口
 */
export { default as TiptapEditor } from './TiptapEditor.vue';
export { default as EditorBubbleMenu } from './EditorBubbleMenu.vue';
export { default as EditorTableMenu } from './EditorTableMenu.vue';
export { default as EditorSlashMenu } from './EditorSlashMenu.vue';
export { buildExtensions } from './extensions';
export type { BuildExtensionsOptions } from './extensions';
export { FontSize } from './extensions/fontSize';
export { LineHeight } from './extensions/lineHeight';
export { PasteWord } from './extensions/pasteWord';
export { PasteImage } from './extensions/pasteImage';
export { FormatPainter, sampleFormats } from './extensions/formatPainter';
export type { FormatPainterFormats, FormatPainterStorage } from './extensions/formatPainter';
export type { PasteImageOptions } from './extensions/pasteImage';
export { SlashCommandExtension, slashCommandKey } from './extensions/slashCommand';
export type { SlashCommandOptions, SlashCommandState } from './extensions/slashCommand';
export {
  createCommandRunner,
  createCommandRunnerWithoutFocus,
  executeCommand,
  executeBatchCommands,
} from './utils/editorCommands';
export type { CommandBuilder, EditorChain } from './utils/editorCommands';
export { createStateCheckers, getCurrentParagraphStyle, getCurrentTextAlign } from './utils/editorState';
export type { StateCheckers } from './utils/editorState';
