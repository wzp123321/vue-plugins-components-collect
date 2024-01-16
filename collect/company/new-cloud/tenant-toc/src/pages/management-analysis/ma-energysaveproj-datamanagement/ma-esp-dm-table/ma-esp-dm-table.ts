/*
 * @Description: 基准值维护
 * @Autor: zpwan
 * @Date: 2022-04-20 17:11:02
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 10:47:13
 */
import { defineComponent } from 'vue';

import sarchBar from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-searchBar.service';
import espTable from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-table.service';
import espBasic from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ms-esp-dm-basic.service';

export default defineComponent({
  name: 'MaEspdmTable',
  setup() {
    return {
      espTable,
      sarchBar,
      espBasic,
    };
  },
});
