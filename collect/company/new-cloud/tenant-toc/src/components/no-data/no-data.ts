/*
 * @Description: 缺省页
 * @Autor: zpwan
 * @Date: 2022-04-06 15:32:30
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-06 15:34:32
 */
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '暂无数据'
    }
  },
  setup(props) {
    const { title } = props;
    return { title };
  }
});
