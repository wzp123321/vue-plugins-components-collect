/*
 * @Description: 户号数据录入
 * @Autor: zpwan
 * @Date: 2022-04-11 10:11:40
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 15:00:24
 */
import { defineComponent } from 'vue';

import MaHeSearch from '@/pages/management-analysis/ma-householdnumber-entry/ma-he-search/ma-he-search.vue';
import MaHeButtonBar from '@/pages/management-analysis/ma-householdnumber-entry/ma-he-buttonbar/ma-he-buttonbar.vue';
import MaHeTable from '@/pages/management-analysis/ma-householdnumber-entry/ma-he-table/ma-he-table.vue';

export default defineComponent({
  name: 'MaHeEntry',
  components: {
    'ma-he-search': MaHeSearch,
    'ma-he-button-bar': MaHeButtonBar,
    'ma-he-table': MaHeTable,
  },
});
