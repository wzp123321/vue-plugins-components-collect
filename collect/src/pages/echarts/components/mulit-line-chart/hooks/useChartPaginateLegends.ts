import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { IMcCustomLegend } from '../model';
import { mapLabelWidth } from '@/utils';

export const useChartPaginateLegends = () => {
  const items = ref<IMcCustomLegend[]>([]);
  const options = reactive<any>({
    containerWidth: 300,
    itemPadding: 16,
  });

  // 当前页码
  const currentPage = ref(1);
  // 每页显示的项目
  const visibleItems = ref<IMcCustomLegend[]>([]);
  // 总页数
  const totalPages = ref(1);
  // 是否显示分页控件
  const showPagination = ref(false);

  // 计算项目总宽度（文本宽度 + 内边距）
  const getItemWidth = (item: IMcCustomLegend) => {
    const textWidth = mapLabelWidth(item.name, '12px');
    return textWidth + options.itemPadding * 2;
  };

  // 计算分页
  const calculatePagination = () => {
    if (items.value.length === 0) {
      visibleItems.value = [];
      totalPages.value = 1;
      currentPage.value = 1;
      showPagination.value = false;
      return;
    }

    let currentWidth = 0;
    const pageStartIndices: number[] = [0];
    const pages: IMcCustomLegend[][] = [[]];

    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i];
      const itemWidth = getItemWidth(item);
      if (currentWidth + itemWidth <= options.containerWidth) {
        // 当前页可以容纳这个项目
        pages[pages.length - 1].push(item);
        currentWidth += itemWidth;
      } else {
        // 需要换页
        pages.push([item]);
        pageStartIndices.push(i);
        currentWidth = itemWidth;
      }
    }

    totalPages.value = pages.length;
    showPagination.value = pages.length > 1;
    visibleItems.value = pages[currentPage.value - 1] || [];
  };

  // 上一页
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      calculatePagination();
    }
  };

  // 下一页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      calculatePagination();
    }
  };

  // 监听窗口大小变化
  const handleResize = () => {
    calculatePagination();
  };

  const init = (list: IMcCustomLegend[], containerWidth: number, itemPadding: number) => {
    items.value = list;
    options.containerWidth = containerWidth;
    options.itemPadding = itemPadding;
    calculatePagination();
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    currentPage,
    totalPages,
    visibleItems,
    showPagination,
    init,
    prevPage,
    nextPage,
    calculatePagination,
  };
};
