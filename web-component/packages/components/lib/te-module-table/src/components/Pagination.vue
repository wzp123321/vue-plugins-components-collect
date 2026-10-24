<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-05-17 14:23:02
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-06-28 15:33:02
 * @Description: 
-->
<template>
  <!-- 分页组件 -->
  <te-pagination
    :background="true"
    style="display: flex; justify-content: flex-end; margin-top: 20px"
    :current-page="pageInfo.pageNum"
    :page-size="pageInfo.pageSize"
    :page-sizes="pageInfo.pageSizes"
    :total="pageInfo.total"
    v-bind="$attrs"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup lang="ts" name="Pagination">
interface PageInfo {
  pageNum: number;
  pageSize: number;
  total: number;
  pageSizes?: number[];
}

interface PaginationProps {
  pageInfo: PageInfo;
  handleSizeChange: (size: number) => void;
  handleCurrentChange: (currentPage: number) => void;
}

defineProps<PaginationProps>();
</script>
