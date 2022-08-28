import { defineComponent } from 'vue';
import TableList from './list.vue';
import { mock } from './utils';

export default defineComponent({
  name: 'VueVirtualListContainer',
  components: {
    TableList,
  },
  setup() {
    const dataCount = 10000;
    const dataSource = mock(10000);

    return {
      dataCount,
      dataSource,
    };
  },
});
