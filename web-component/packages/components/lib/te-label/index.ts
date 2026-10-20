import TeLabel from './src/te-label.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeLabel.install = (app: any) => {
  app.component('te-label', TeLabel);
};
export { TeLabel };
