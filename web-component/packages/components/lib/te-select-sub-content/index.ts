import TeSelectSubContent from './src/te-select-sub-content.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeSelectSubContent.install = (app: any) => {
  app.component('te-select-sub-content', TeSelectSubContent);
};
export { TeSelectSubContent };