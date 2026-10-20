import TeImmediateTransfer from './src/te-immediate-transfer.vue';
import TeImmediateTransferTreeItem from './src/components/left-tree-item.vue';
TeImmediateTransfer.install = (app: any) => {
  app.component('te-immediate-transfer', TeImmediateTransfer);
};
export { TeImmediateTransfer, TeImmediateTransferTreeItem };
