import TeDynamicTable from "./src/index.vue";
import type { DynamicTableProps, Columns } from "./src/type";

TeDynamicTable.install = (app: any) => {
  app.component("te-dynamic-table", TeDynamicTable);
};
export { TeDynamicTable, DynamicTableProps, Columns };
