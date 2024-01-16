/*
 * @Description: 首页组件-容器
 * @Author: zpwan
 * @Date: 2022-07-14 16:45:48
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-07-14 16:48:42
 */
import { defineComponent, toRef } from 'vue';

export default defineComponent({
  name: 'HomeComponentContainer',
  props: {
    headTitle: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const headTitle = toRef(props, 'headTitle');

    return {
      headTitle,
    };
  },
});
