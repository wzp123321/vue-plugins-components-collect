import { CD_CostDetailConvertVO } from './list.api';
import { defineComponent, onMounted, ref } from 'vue';
import { mock } from './utils';

import { ElSelect } from 'element-plus';

export default defineComponent({
  name: 'VueVirtualListContainer',
  components: {
    'el-select': ElSelect,
    'el-option': ElSelect.Option,
  },
  setup() {
    const dataSource = ref<CD_CostDetailConvertVO[]>(mock(300));
    const itemSize = ref<number>(60);
    const poolBuffer = ref<number>(10);

    const root = ref<HTMLElement | null>(null);
    const pool = ref<CD_CostDetailConvertVO[]>([]);
    const scrollHeight = ref(dataSource.value.length * itemSize.value);

    let containerSize = 0;
    const paddingTop = ref(0);
    let isScrollBusy = false;

    const handleScroll = () => {
      if (!root.value) return;
      if (isScrollBusy) return;
      isScrollBusy = true;

      requestAnimationFrame(() => {
        isScrollBusy = false;
        if (!root.value) return;
        const range: number[] = [];
        range[0] = Math.floor(root.value.scrollTop / itemSize.value) - Math.floor(poolBuffer.value / 2);
        range[0] = Math.max(range[0], 0);
        range[1] = range[0] + Math.floor(root.value.clientHeight / itemSize.value) + poolBuffer.value;
        range[1] = Math.min(range[1], dataSource.value.length);
        /**
         * 需要渲染的列表
         */
        pool.value = dataSource.value.slice(range[0], range[1]).map((v, i) => ({ ...v, _index: range[0] + i }));
        paddingTop.value = range[0] * itemSize.value;
      });
    };
    const handleInsert = () => {
      dataSource.value.splice(2, 0, ...mock(2, true));
      pool.value = [];

      if (!root.value) return;
      const range: number[] = [];
      range[0] = Math.floor(root.value.scrollTop / itemSize.value) - Math.floor(poolBuffer.value / 2);
      range[0] = Math.max(range[0], 0);
      range[1] = range[0] + Math.floor(root.value.clientHeight / itemSize.value) + poolBuffer.value;
      range[1] = Math.min(range[1], dataSource.value.length);
      /**
       * 需要渲染的列表
       */
      pool.value = dataSource.value.slice(range[0], range[1]).map((v, i) => ({ ...v, _index: range[0] + i }));
      paddingTop.value = range[0] * itemSize.value;

      console.log(range, root.value.scrollTop, root.value.clientHeight);
    };

    const rowClick = (row: CD_CostDetailConvertVO, index: number) => {
      console.log(row, index);
    };

    onMounted(() => {
      try {
        if (!root.value) return;
        containerSize = root.value.clientHeight;
        const contentLines = Math.ceil(containerSize / itemSize.value);
        const totalLines = contentLines + poolBuffer.value;
        const range = [0, totalLines];
        pool.value = dataSource.value
          .slice(range[0], range[0] + range[1])
          .map((v, i) => ({ ...v, _index: range[0] + i }));
        console.log(pool.value.length);
      } catch (error) {
        console.log(error);
      }
    });

    return {
      itemSize,
      dataSource,
      pool,
      scrollHeight,
      root,
      paddingTop,

      handleScroll,
      handleInsert,
      rowClick,
    };
  },
});
