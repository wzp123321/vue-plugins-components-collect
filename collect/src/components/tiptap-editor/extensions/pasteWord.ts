/**
 * PasteWord 粘贴 Word 净化扩展
 * @description 参考 hlms-bi-front 的同名扩展：清理从 Word / WPS 粘贴进来的
 * HTML 垃圾（o:p 标签、条件注释、style/meta/link、Mso 类名、mso-* 内联样式），
 * 避免把 Office 私有标记带进编辑器
 */
import { Extension } from '@tiptap/vue-3';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface PasteWordOptions {
  /** 是否剥离粘贴内容中的 font-family（统一走编辑器默认字体），默认 true */
  stripFontFamily?: boolean;
}

export const PasteWord = Extension.create<PasteWordOptions>({
  name: 'pasteWord',

  addOptions() {
    return {
      stripFontFamily: true,
    };
  },

  addProseMirrorPlugins() {
    const stripFontFamily = this.options.stripFontFamily !== false;

    return [
      new Plugin({
        key: new PluginKey('pasteWord'),
        props: {
          transformPastedHTML: (html: string) => {
            if (!html) return html;

            let result = html
              // Office 私有标签与条件注释（Word 列表定义等）
              .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
              .replace(/<!--[\s\S]*?-->/gi, '')
              // 文档级垃圾标签
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<link[^>]*>/gi, '')
              .replace(/<xml[^>]*>[\s\S]*?<\/xml>/gi, '')
              // Word 类名（MsoNormal 等）与 mso-* 内联样式
              .replace(/\sclass="?Mso[^"]*"?/gi, '')
              .replace(/\smso-[a-z-]+\s*:\s*[^;'"]*;?/gi, '');

            if (stripFontFamily) {
              result = result.replace(/font-family\s*:\s*[^;'"]+;?/gi, '');
            }

            // 剥离 img 的 file:// 本地路径 src（浏览器安全策略禁止加载），保留 img 标签
            result = result.replace(/(<img[^>]*?)src="file:\/\/[^"]*"([^>]*?>)/gi, '$1$2');

            return result;
          },
        },
      }),
    ];
  },
});
