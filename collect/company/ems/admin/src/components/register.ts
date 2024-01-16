const files: any = import.meta.globEager('./**/*.vue');
import registerAntdV from './register-antd';
import registerElementPlusUI from './register-element-plus';
import { App } from 'vue';

const install = (app: App<Element>) => {
  registerElementPlusUI(app);
  registerAntdV(app);
  if (files && Object.keys(files)) {
    Object.keys(files).forEach((item) => {
      const firstName = item.split('/');
      const componentName = firstName[firstName.length - 1].split('.')[0];
      app.component(componentName, files[item].default);
    });
  }
};

export default install;
