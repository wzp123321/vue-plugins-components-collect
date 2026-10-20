import TeLayoutTree from './src/te-layout-tree.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeLayoutTree.install = (app: any) => {
  app.component('te-layout-tree', TeLayoutTree);
};
export { TeLayoutTree };
