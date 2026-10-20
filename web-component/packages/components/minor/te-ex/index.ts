import TeEx from './src/index.vue';
TeEx.install = (app) => {
  app.component(TeEx.name, TeEx);
};
export { TeEx };
