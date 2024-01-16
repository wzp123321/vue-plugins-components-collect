/*
 * @Description: 节能项目管理
 * @Autor: zpwan
 * @Date: 2022-04-20 14:29:46
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 10:47:21
 */
import { defineComponent } from 'vue';

import MaEspdmBasicMaintain from '@/pages/management-analysis/ma-energysaveproj-datamanagement/ma-esp-dm-basic-maintain/ma-esp-dm-basic-maintain.vue';
import MaEspdmTable from '@/pages/management-analysis/ma-energysaveproj-datamanagement/ma-esp-dm-table/ma-esp-dm-table.vue';
import MaEspdmForm from '@/pages/management-analysis/ma-energysaveproj-datamanagement/ma-esp-dm-form/ma-esp-dm-form.vue';

export default defineComponent({
  name: 'EnergySaveProjDataManagement',
  components: {
    'ma-esp-dm-basic-maintain': MaEspdmBasicMaintain,
    'ma-esp-dm-table': MaEspdmTable,
    'ma-esp-dm-form': MaEspdmForm,
  },
});
