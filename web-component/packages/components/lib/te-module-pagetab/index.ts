import TeModulePagetab from './src/te-module-pagetab.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeModulePagetab.install = (app: any) => {
  app.component('te-module-pagetab', TeModulePagetab);
};
export { TeModulePagetab };
