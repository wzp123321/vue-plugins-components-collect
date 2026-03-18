import { App } from 'vue';
/**
 * 批量导入指令文件，并注册为全局指令
 * ps：文件名即指令名
 */
const modules: Record<string, any> = import.meta.glob('/*.ts', {
  eager: true,
});
const mapDirective = new Map();
Object.keys(modules).forEach((key) => {
  if (modules[key] && modules[key].default) {
    const newKey = key.replace(/^\.\/[a-z]+\/|\.ts|\.js/g, '');
    mapDirective.set(newKey, modules[key].default);
  }
});

export default (app: App) => {
  mapDirective.forEach((value, key) => {
    app.directive(key, value);
  });
};
