import TeEmployee from './src/te-employee.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeEmployee.install = (app: any) => {
  app.component('te-employee', TeEmployee);
};
export { TeEmployee };
