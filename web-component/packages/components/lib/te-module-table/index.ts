import TeModuleTable from "./src/te-module-table.vue";
import ColSettingBtn from "./src/components/ColSettingBtn.vue";
import TeTableButtonGroup from "./src/components/TeTableButtonGroup.vue";

TeModuleTable.install = (app: any) => {
	app.component("te-module-table", TeModuleTable);
};
export { TeModuleTable, ColSettingBtn, TeTableButtonGroup };
