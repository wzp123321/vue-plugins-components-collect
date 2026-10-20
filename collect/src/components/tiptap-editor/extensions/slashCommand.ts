/**
 * SlashCommand 斜杠命令扩展
 * @description 参考 hlms-bi-front 的同名扩展：段落开头输入 / 时激活命令菜单，
 * 通过 ProseMirror 插件状态 + view 回调把激活态/位置/查询词暴露给 UI 组件
 */
import { Extension } from '@tiptap/vue-3';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const slashCommandKey = new PluginKey('slashCommand');

export interface SlashCommandState {
  active: boolean;
  range: { from: number; to: number } | null;
  query: string;
  /** 菜单位置（视口坐标），由 view 更新时计算 */
  decorationPosition: { x: number; y: number } | null;
}

export interface SlashCommandOptions {
  onActivate?: (state: SlashCommandState) => void;
  onDeactivate?: () => void;
  onQueryChange?: (query: string) => void;
}

const INACTIVE: SlashCommandState = { active: false, range: null, query: '', decorationPosition: null };

export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      onActivate: undefined,
      onDeactivate: undefined,
      onQueryChange: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extensionOptions = this.options;

    return [
      new Plugin({
        key: slashCommandKey,

        state: {
          init(): SlashCommandState {
            return { ...INACTIVE };
          },

          apply(tr, prev, _oldState, newState): SlashCommandState {
            // 显式关闭
            const meta = tr.getMeta(slashCommandKey);
            if (meta?.deactivate) {
              return { ...INACTIVE };
            }

            // 文档与选区均未变化，保持原状
            if (!tr.docChanged && !tr.selectionSet) {
              return prev;
            }

            const { selection } = newState;
            const { $from } = selection;

            // 仅响应光标选区
            if (!selection.empty) {
              return prev.active ? { ...INACTIVE } : prev;
            }

            // 匹配段落开头到光标处的 /关键词
            const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
            const match = textBefore.match(/^\/(\S*)$/);

            if (match) {
              return {
                active: true,
                range: { from: $from.start(), to: $from.pos },
                query: match[1],
                decorationPosition: null,
              };
            }

            return prev.active ? { ...INACTIVE } : prev;
          },
        },

        view() {
          return {
            update(view) {
              const state = slashCommandKey.getState(view.state) as SlashCommandState | undefined;
              if (!state) return;

              if (state.active && state.range) {
                const coords = view.coordsAtPos(state.range.from);
                extensionOptions.onActivate?.({
                  ...state,
                  decorationPosition: { x: coords.left, y: coords.bottom },
                });
                extensionOptions.onQueryChange?.(state.query);
              } else {
                extensionOptions.onDeactivate?.();
              }
            },
          };
        },
      }),
    ];
  },
});
