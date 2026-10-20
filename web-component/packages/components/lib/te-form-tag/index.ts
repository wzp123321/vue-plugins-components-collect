import TeFormTag from './src/te-form-tag.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeFormTag.install = (app: any) => {
  app.component('te-form-tag', TeFormTag);
};
export { TeFormTag };