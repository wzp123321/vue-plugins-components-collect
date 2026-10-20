import TeSidenav from './src/te-sidenav.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeSidenav.install = (app: any) => {
  app.component('te-sidenav', TeSidenav);
};
export { TeSidenav };