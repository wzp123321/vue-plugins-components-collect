/*
 * @Author: DLL
 * @Description: 默认空数据组件
 */

import { defineComponent, toRefs } from 'vue';
export default defineComponent({
  name: 'transformerDataNone',
  props: {
    tips: {
      type: String,
      default: '',
    },
    // 默认图片的大小
    size: {
      type: String,
      default: '150',
    },
  },
  setup(props) {
    const { tips, size } = toRefs(props);
    return {
      tips,
      size,
    };
  },
});
