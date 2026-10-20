import TeDepartment from './src/te-department.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeDepartment.install = (app: any) => {
  app.component('te-department', TeDepartment);
};
export { TeDepartment };
