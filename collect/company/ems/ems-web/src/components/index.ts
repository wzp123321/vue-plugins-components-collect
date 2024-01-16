const files: any = require.context('./common/', true, /\.vue$/);
import { App } from 'vue';

const install = (app: App<Element>) => {
  if (files && files.keys()) {
    files.keys().forEach((item: string) => {
      const reqComp = item.split('/');
      const componentName = reqComp[reqComp.length - 1].split('.')[0];
      app.component(componentName, files(item).default || files(item));
    });
  }
};

export default install;
