import Te401 from "./src/index.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Te401.install = (app: any) => {
	app.component("te-401", Te401);
};
export { Te401 };
