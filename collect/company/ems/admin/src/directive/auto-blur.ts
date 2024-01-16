import { App } from 'vue';

/**
 * enter失焦指令
 * @param app
 */
const vAutoBlur = (app: App) => {
  app.directive('auto-blur', {
    mounted: (el: HTMLInputElement) => {
      const inputEl: HTMLInputElement | HTMLTextAreaElement | null =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      inputEl?.addEventListener('keyup', (event: any) => {
        if (event.key === 'Enter') {
          (event.target as HTMLInputElement).blur();
        }
      });
    },
  });
};

export default vAutoBlur;
