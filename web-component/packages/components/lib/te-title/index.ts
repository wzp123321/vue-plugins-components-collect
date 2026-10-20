import TeTitle from './src/te-title.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeTitle.install = (app: any) => {
  app.component('te-title', TeTitle);
};
export { TeTitle };
