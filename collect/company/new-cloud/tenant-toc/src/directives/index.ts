import { App } from 'vue';
import vAutoFocus from './auto-focus';
import vAutoBlur from './auto-blur';
import vDrag from './draggable';
import vInputFilter from './input-filter';
import vInputFilterV2 from './directive-input-filter';

/**
 * 注册指令
 * @param app
 */
export const registerDirective = (app: App) => {
  app.use(vAutoFocus);
  app.use(vAutoBlur);
  app.use(vDrag);
  app.use(vInputFilter);
  app.use(vInputFilterV2);
};
