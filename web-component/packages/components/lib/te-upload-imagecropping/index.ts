import TeUploadImagecropping from './src/te-upload-imagecropping.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeUploadImagecropping.install = (app: any) => {
  app.component('te-upload-imagecropping', TeUploadImagecropping);
};
export { TeUploadImagecropping };
