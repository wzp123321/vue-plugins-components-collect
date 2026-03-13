import { ref } from 'vue';

export default () => {
  const pageSize = ref(0);
  const pageNum = ref(0);
  /**
   * 设置分页
   */
  const setPage = (page: { pageSize: number; pageNum: number }) => {
    pageSize.value = page.pageSize;
    pageNum.value = page.pageNum;
  };
  return {
    pageSize,
    pageNum,
    setPage,
  };
};
