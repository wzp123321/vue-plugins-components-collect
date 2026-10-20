import TeGlobalnav from './src/te-globalnav.vue';
import type { globalnavMenuItem } from "./src/constants";

TeGlobalnav.install = (app: any) => {
  app.component('te-globalnav', TeGlobalnav);
};

export { 
  TeGlobalnav,
  globalnavMenuItem
 };
