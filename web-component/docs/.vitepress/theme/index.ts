import ElementPlus from 'element-plus';
import TsElementPlus from 'element-plus';

import VPApp, { NotFound, globals } from '../vitepress';
import { define } from '../utils/types';
import 'uno.css';
import './style.css';
import type { Theme } from 'vitepress';
import '@zpackage/web-package/dist/styles/index.css';
import '@zpackage/web-package/dist/styles/element/dark.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

// import router from "../router";
export default define<Theme>({
  NotFound,
  Layout: VPApp,
  enhanceApp: ({ app }) => {
    app.use(ElementPlus);
    app.use(TsElementPlus, {
      locale: zhCn,
    });
    // if (typeof window !== 'undefined') {
    //   app.use(router)
    // }

    globals.forEach(([name, Comp]) => {
      app.component(name, Comp);
    });
  },
});
