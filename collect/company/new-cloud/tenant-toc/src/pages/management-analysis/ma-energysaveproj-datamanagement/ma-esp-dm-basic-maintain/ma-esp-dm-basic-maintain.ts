/*
 * @Description: 基准值维护
 * @Autor: zpwan
 * @Date: 2022-04-20 17:11:02
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 09:51:00
 */
import { defineComponent } from 'vue';

import espBasic from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ms-esp-dm-basic.service';
import sarchBar from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-searchBar.service';
import espTable from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-table.service';

export default defineComponent({
  name: 'MaEspdmBasicMaintain',
  setup() {
    // 表单提交
    const onSubmit = async () => {
      const flag = await espBasic.submit();
      if (flag) {
        espTable.query(sarchBar.espForm);
        espBasic.close();
      }
    };
    return {
      espBasic,
      sarchBar,
      onSubmit,
    };
  },
});
