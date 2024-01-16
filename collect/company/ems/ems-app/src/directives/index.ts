import type { App } from 'vue';
import { vFilterEmoji } from './directive-filterEmoji';

/**
 * 注册
 * @param app
 */
export const registerDirective = (app: App) => {
  app.directive('filterEmoji', vFilterEmoji);
};
