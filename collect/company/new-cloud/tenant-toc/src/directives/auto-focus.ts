import { App } from 'vue';

/**
 * 自动聚焦指令
 * @param app
 */
const vAutoFocus = (app: App) => {
  // 记录是否操作
  app.directive('auto-focus', {
    mounted(el, binding) {
      const inputEl: HTMLInputElement =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      inputEl?.focus();
    },
  });
};

export default vAutoFocus;
