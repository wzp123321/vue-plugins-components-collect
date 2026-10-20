import TeSpaceSelect from './src/te-space-select.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeSpaceSelect.install = (app: any) => {
    app.component('te-space-select', TeSpaceSelect);
};
export { TeSpaceSelect };