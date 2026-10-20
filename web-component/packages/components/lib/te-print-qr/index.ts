import TePrintQr from './src/te-print-qr.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TePrintQr.install = (app: any) => {
    app.component('te-print-qr', TePrintQr);
};
export { TePrintQr };
