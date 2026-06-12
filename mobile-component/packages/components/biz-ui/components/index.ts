import type { App, Plugin } from 'vue';

import TsmbizSelectDepartmentEmployee from './tsmbiz-select-department-employee/uniapp/tsmbiz-select-department-employee.vue';

const components = [
  TsmbizSelectDepartmentEmployee,
];

const install = (app: App): void => {
  components.forEach((comp: any) => {
    app.component(comp.name || comp.__name, comp);
  });
};

const plugin: Plugin = { install };

export { TsmbizSelectDepartmentEmployee };

export default plugin;
