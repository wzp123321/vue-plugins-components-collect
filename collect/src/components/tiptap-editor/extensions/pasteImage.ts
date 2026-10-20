/**
 * PasteImage 粘贴图片扩展
 * @description 参考 hlms-bi-front 的同名扩展：
 * - 纯图片粘贴（截图 / 复制的图片文件）：走 uploadImage 上传或回退 base64 插入
 * - 图文混排粘贴（Word / WPS）：提取剪贴板图片二进制，替换 HTML 中的 file:// 路径后一起插入
 * - 仅 HTML 且含 file:// 图片：剥掉无法加载的 img 节点，保留文字
 */
import { Extension } from '@tiptap/vue-3';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DOMParser as PMDOMParser } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';

export interface PasteImageOptions {
  /** 图片上传函数，传入则走服务端上传，不传则回退 base64（演示用） */
  uploadImage?: (file: File) => Promise<string>;
}

/** 将图片文件转为 URL（上传或 base64） */
function fileToUrl(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
  if (uploadImage) {
    return uploadImage(file);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  });
}

/** 解析 HTML 字符串为 ProseMirror slice 并替换当前选区 */
function insertHtmlAtSelection(view: EditorView, html: string) {
  const dom = new window.DOMParser().parseFromString(html, 'text/html');
  const pmParser = PMDOMParser.fromSchema(view.state.schema);
  const slice = pmParser.parseSlice(dom.body);
  const { state, dispatch } = view;
  dispatch(state.tr.replaceSelection(slice));
}

export const PasteImage = Extension.create<PasteImageOptions>({
  name: 'pasteImage',

  addOptions() {
    return {
      uploadImage: undefined,
    };
  },

  addProseMirrorPlugins() {
    const uploadImage = this.options.uploadImage;

    return [
      new Plugin({
        key: new PluginKey('pasteImage'),
        props: {
          handlePaste: (view: EditorView, event: ClipboardEvent) => {
            if (!view || !event.clipboardData) return false;

            const clipboard = event.clipboardData;
            const items = Array.from(clipboard.items);
            const imageFiles = Array.from(clipboard.files || []).filter((f) => f.type.indexOf('image') !== -1);
            const hasHtml = items.some((item) => item.type === 'text/html');

            // 图文混排粘贴：剪贴板同时有 HTML 与图片二进制时，
            // 提取图片转 URL，按序替换 HTML 中的 file:// 后一起插入
            if (hasHtml && imageFiles.length > 0) {
              const htmlText = clipboard.getData('text/html');
              if (!htmlText) return false;

              event.preventDefault();

              Promise.all(imageFiles.map((f) => fileToUrl(f, uploadImage)))
                .then((urls) => {
                  let result = htmlText;
                  urls.forEach((url) => {
                    result = result.replace(/src="file:\/\/[^"]*"/, `src="${url}"`);
                  });
                  try {
                    insertHtmlAtSelection(view, result);
                  } catch (err) {
                    console.error('粘贴图文混排内容解析失败', err);
                  }
                })
                .catch((err) => {
                  console.error('粘贴图片上传失败', err);
                });

              return true;
            }

            // 图文混排粘贴：仅有 HTML 时，移除 file:// 的 img 节点，仅保留文字
            if (hasHtml) {
              const htmlText = clipboard.getData('text/html');
              if (!htmlText) return false;

              const cleaned = htmlText.replace(/<img[^>]*src="file:\/\/[^"]*"[^>]*>/gi, '');
              if (cleaned === htmlText) return false;

              event.preventDefault();
              try {
                insertHtmlAtSelection(view, cleaned);
              } catch (err) {
                console.error('粘贴图文混排内容解析失败', err);
              }
              return true;
            }

            // 纯图片粘贴（截图、复制图片文件等）
            const imageItem = items.find((item) => item.type.indexOf('image') !== -1);
            if (imageItem) {
              const file = imageItem.getAsFile();
              if (file) {
                event.preventDefault();
                fileToUrl(file, uploadImage)
                  .then((src) => {
                    const { schema } = view.state;
                    if (schema.nodes.image) {
                      const imageNode = schema.nodes.image.create({ src });
                      view.dispatch(view.state.tr.replaceSelectionWith(imageNode));
                    }
                  })
                  .catch((err) => {
                    console.error('粘贴图片处理失败', err);
                  });
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
