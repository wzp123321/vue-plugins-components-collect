/*
 * @Description: 树选择
 * @Author: zpwan
 * @Date: 2022-06-29 09:59:24
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-30 10:54:49
 */
import { defineComponent, PropType, toRef } from 'vue';
import PermissionConfigureTree from '../services/permission-configure-tree.service';

export default defineComponent({
  name: 'PermissionConfigureTreeSelect',
  props: {
    // 标题
    pcTreeSelect: {
      type: Object as PropType<PermissionConfigureTree>,
      defualt: {},
    },
  },
  setup(this, props, ctx) {
    const pcTreeSelect = toRef(props, 'pcTreeSelect');

    return { pcTreeSelect };
  },
});
