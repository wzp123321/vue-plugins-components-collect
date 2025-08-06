import { ref, computed, onMounted, onUnmounted } from 'vue';

interface LegendItem {
  id: number;
  name: string;
}

interface UseLegendPaginationOptions {
  containerWidth?: number;
  itemPadding?: number;
  fontSize?: number;
  fontFamily?: string;
}

export function useLegendPagination(items: LegendItem[], options: UseLegendPaginationOptions = {}) {
  const { containerWidth = 300, itemPadding = 20, fontSize = 12, fontFamily = 'Arial' } = options;

  // 当前页码
  const currentPage = ref(1);
  // 每页显示的项目
  const visibleItems = ref<LegendItem[]>([]);
  // 总页数
  const totalPages = ref(1);
  // 是否显示分页控件
  const showPagination = ref(false);
  // 测量用的隐藏元素
  const hiddenMeasureRef = ref<HTMLElement | null>(null);

  // 计算文本宽度
  const getTextWidth = (text: string) => {
    if (!hiddenMeasureRef.value) return 0;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;

    context.font = `${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  // 计算项目总宽度（文本宽度 + 内边距）
  const getItemWidth = (item: LegendItem) => {
    const textWidth = getTextWidth(item.name);
    return textWidth + itemPadding * 2;
  };

  // 计算分页
  const calculatePagination = () => {
    if (items.length === 0) {
      visibleItems.value = [];
      totalPages.value = 1;
      currentPage.value = 1;
      showPagination.value = false;
      return;
    }

    let currentWidth = 0;
    const pageStartIndices: number[] = [0];
    const pages: LegendItem[][] = [[]];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemWidth = getItemWidth(item);

      if (currentWidth + itemWidth <= containerWidth) {
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

  onMounted(() => {
    calculatePagination();
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
    prevPage,
    nextPage,
    hiddenMeasureRef,
  };
}
