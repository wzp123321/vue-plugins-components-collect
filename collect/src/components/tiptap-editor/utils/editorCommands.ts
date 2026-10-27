/**
 * 编辑器命令执行工具
 * @description 参考 hlms-bi-front 的 editorCommands.ts：统一处理 editor 实例判空与焦点管理
 */
import type { Ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';

/** 链式命令类型 */
export type EditorChain = ReturnType<Editor['chain']>;

/** 命令构建函数类型 */
export type CommandBuilder = (chain: EditorChain) => EditorChain;

/**
 * 创建命令执行器（执行前自动 focus）
 * @example
 * const runCommand = createCommandRunner(editor)
 * const toggleBold = runCommand((chain) => chain.toggleBold())
 * toggleBold()
 */
export const createCommandRunner = (
  editor: Ref<Editor | null | undefined>,
) => (fn: CommandBuilder) => () => {
  const instance = editor.value;
  if (!instance) return;
  fn(instance.chain().focus()).run();
};

/**
 * 创建不带焦点的命令执行器
 */
export const createCommandRunnerWithoutFocus = (
  editor: Ref<Editor | null | undefined>,
) => (fn: CommandBuilder) => () => {
  const instance = editor.value;
  if (!instance) return;
  fn(instance.chain()).run();
};

/**
 * 直接执行一条命令
 * @returns 是否执行成功
 */
export const executeCommand = (
  editor: Ref<Editor | null | undefined>,
  fn: CommandBuilder,
  withFocus = true,
): boolean => {
  const instance = editor.value;
  if (!instance) return false;
  const chain = withFocus ? instance.chain().focus() : instance.chain();
  return fn(chain).run();
}

/**
 * 按顺序批量执行多条命令
 * @returns 是否全部执行成功
 */
export const executeBatchCommands = (
  editor: Ref<Editor | null | undefined>,
  commands: CommandBuilder[],
  withFocus = true,
): boolean => {
  const instance = editor.value;
  if (!instance) return false;
  let chain = withFocus ? instance.chain().focus() : instance.chain();
  commands.forEach((command) => {
    chain = command(chain);
  });
  return chain.run();
}
