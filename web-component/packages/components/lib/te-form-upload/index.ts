import TeFormUpload from './src/te-form-upload.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeFormUpload.install = (app: any) => {
  app.component('te-form-upload', TeFormUpload);
};
export { TeFormUpload };