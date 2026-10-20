import TeTablebar from './src/te-tablebar.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeTablebar.install = (app: any) => {
  app.component('te-tablebar', TeTablebar);
};
export { TeTablebar };