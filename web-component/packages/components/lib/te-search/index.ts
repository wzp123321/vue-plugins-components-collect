import TeSearch from './src/te-search.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeSearch.install = (app: any) => {
  app.component('te-search', TeSearch);
};
export { TeSearch };
