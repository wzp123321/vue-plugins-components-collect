import TeTreeEdit from './src/te-tree-edit.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeTreeEdit.install = (app: any) => {
  app.component('te-tree-edit', TeTreeEdit);
};
export { TeTreeEdit };
