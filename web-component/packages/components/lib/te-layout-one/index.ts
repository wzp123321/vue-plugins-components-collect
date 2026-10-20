import TeLayoutOne from "./src/index.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeLayoutOne.install = (app: any) => {
  app.component("te-layout-one", TeLayoutOne);
};
export { TeLayoutOne };
