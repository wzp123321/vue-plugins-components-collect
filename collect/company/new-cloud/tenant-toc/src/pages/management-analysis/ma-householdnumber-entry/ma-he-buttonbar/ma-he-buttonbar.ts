/*
 * @Description: 户号数据录入
 * @Autor: zpwan
 * @Date: 2022-04-11 10:11:40
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-05 20:22:17
 */
import { defineComponent } from 'vue';

import heTable from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-table.service';
import heForm from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-form.service';
import heButtonBar from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-buttonbar.service';

import { FORM_STATUS } from '../constant/index';

export default defineComponent({
  name: 'MaHeButtonBar',
  setup() {
    // 模板导入
    const onTemplateImport = async () => {
      const res = await heButtonBar.fileImport();
      if (res) {
        heTable.query();
      }
    };
    //录入
    const onAdd = () => {
      heForm.resetFormInAdd();
      heForm.show();
    };

    return {
      heTable,
      heForm,
      heButtonBar,
      FORM_STATUS,

      onTemplateImport,
      onAdd,
    };
  },
});
