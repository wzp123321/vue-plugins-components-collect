/*
 * @Description: page-container
 * @Autor: zpwan
 * @Date: 2022-04-06 13:49:43
 * @LastEditors: yut
 * @LastEditTime: 2023-12-08 09:48:26
 */
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'TenantPageContainer',
  props: {
    // 标题
    title: {
      type: String,
      default: '',
    },
    hasSearch: {
      type: Boolean,
      default: true,
    },
    hasTitle: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const pageTitle = computed(() => {
      return props.title;
    });
    const hasSearch = computed(() => {
      return props.hasSearch;
    });
    const hasTitle = computed(() => {
      return props.hasTitle;
    });

    return { pageTitle, hasSearch, hasTitle };
  },
});
