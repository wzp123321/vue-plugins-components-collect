const files: any = import.meta.globEager('./**/*.vue');
import { App } from 'vue';
import registerInput from './register-input';

const install = (app: App<Element>) => {
  registerInput(app);
  if (files && Object.keys(files)) {
    Object.keys(files).forEach((item) => {
      const firstName = item.split('/');
      const componentName = firstName[firstName.length - 1].split('.')[0];
      app.component(componentName, files[item].default);
    });
  }
};

export default install;
