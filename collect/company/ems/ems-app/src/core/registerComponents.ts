const files: any = import.meta.globEager('../components/**/*.vue');

/**
 * 全局注册组件
 */
const install = (app: any) => {
  if (files && Object.keys(files)) {
    Object.keys(files).forEach((item) => {
      const firstName = item.split('/');
      const componentName = firstName[firstName.length - 1].split('.')[0];
      app.component(componentName, files[item].default);
    });
  }
};

export default install;
