/*
 * @Description: 基准值维护
 * @Autor: zpwan
 * @Date: 2022-04-20 17:11:02
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 13:51:47
 */
import { defineComponent, onMounted } from 'vue';

import espBasic from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ms-esp-dm-basic.service';
import sarchBar from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-searchBar.service';
import espTable from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-table.service';

export default defineComponent({
  name: 'MaEspdmForm',
  setup() {
    onMounted(async () => {
      try {
        const flag = await sarchBar.init();
        if (flag) {
          espTable.query(sarchBar.espForm);
        } else {
          espTable.loading = false;
          espTable.is_error = true;
        }
      } catch (error) {
        espTable.loading = false;
        espTable.is_error = true;
      }
    });

    const onSearch = () => {
      sarchBar.refreshParams();
      espTable.query(sarchBar.espForm);
    };
    //   重置
    const onReset = () => {
      sarchBar.reset();
      espTable.query(sarchBar.espForm);
    };
    return {
      espBasic,
      sarchBar,
      espTable,
      onSearch,
      onReset,
    };
  },
});
