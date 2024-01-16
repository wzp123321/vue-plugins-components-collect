/*
 * @Description: 户号数据录入
 * @Autor: zpwan
 * @Date: 2022-04-11 10:11:40
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 14:47:03
 */
import { defineComponent, onMounted } from 'vue';

import heTable from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-table.service';
import heForm from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-form.service';

export default defineComponent({
  name: 'MaHeSearch',
  setup() {
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        await heTable.init();
        heForm.energyCodeList = heTable.energyCodeList;
        heTable.query();
      } catch (error) {
        heTable.loading = false;
      }
    });

    return {
      heTable,
      heForm,
    };
  },
});
