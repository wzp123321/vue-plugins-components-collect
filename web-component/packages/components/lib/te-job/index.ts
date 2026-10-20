import TeJob from './src/te-job.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeJob.install = (app: any) => {
  app.component('te-job', TeJob);
};
export { TeJob };
