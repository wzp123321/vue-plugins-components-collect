/*
 * @Description: table
 * @Autor: zpwan
 * @Date: 2022-04-11 10:11:40
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-06 10:37:54
 */
import { defineComponent } from 'vue';

import heTable from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-table.service';
import heForm from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-he-form.service';

import { FORM_STATUS, rules } from '../constant/index';
import { FILE_TYPE } from '@/config/enum';

import { onScroll } from '@/utils/index';

import preview from 'vue3-preview';

export default defineComponent({
  name: 'MaHeTable',
  components: {
    preview,
  },
  setup() {
    // 保存
    const onSubmit = async () => {
      const res = await heForm.submit();
      if (res) {
        heForm.close();
        heTable.query();
      }
    };
    // 编辑
    const onEditor = (item: NHouseholdNumber.AccountNumberInfo) => {
      heForm.resetFormInEditor(heTable.searchYear, item);
      heForm.show();
    };

    return {
      heTable,
      heForm,
      rules,
      FORM_STATUS,
      FILE_TYPE,
      onSubmit,
      onScroll,
      onEditor,
    };
  },
});
