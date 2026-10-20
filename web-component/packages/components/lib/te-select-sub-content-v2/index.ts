import TeSelectSubContentV2 from "./src/te-select-sub-content-v2.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeSelectSubContentV2.install = (app: any) => {
	app.component("te-select-sub-content-v2", TeSelectSubContentV2);
};
export { TeSelectSubContentV2 };
