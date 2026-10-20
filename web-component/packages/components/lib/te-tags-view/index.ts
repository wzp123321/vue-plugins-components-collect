import TeTagsView from "./src/index.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeTagsView.install = (app: any) => {
  app.component("te-tags-view", TeTagsView);
};
export { TeTagsView };
