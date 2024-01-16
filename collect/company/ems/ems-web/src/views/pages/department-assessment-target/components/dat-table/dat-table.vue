<!--
 * @Author: yut
 * @Date: 2023-07-11 11:20:16
 * @LastEditors: yut
 * @LastEditTime: 2023-10-31 11:20:03
 * @Descripttion: 科室考核目标值维护表格
-->
<template>
  <div class="dat-table" v-loading="datService.loading">
    <te-table :data="datService.tableData" v-if="datService?.tableTitleList.length && !datService.loading">
      <!-- 固定列 -->
      <te-table-column type="index" label="序号" width="80" fixed align="center">
        <template #default="scope">
          <span>{{ scope.$index + (datService.pageNum - 1) * datService.pageSize + 1 }} </span>
        </template>
      </te-table-column>

      <te-table-column
        v-for="(item, index) in datService.fixedTitleList"
        :key="index"
        fixed
        :label="item.indexName"
        align="center"
        show-overflow-tooltip
        :width="200"
      >
        <template #default="{ row }">
          <div>
            {{ row.treeName }}
          </div>
        </template>
      </te-table-column>
      <!-- 动态列 -->
      <te-table-column
        v-for="(item, index) in datService.tableTitleList"
        :key="index"
        :label="item.indexName"
        align="center"
        show-overflow-tooltip
        :min-width="160"
      >
        <template #default="{ row }">
          <!-- <div v-if="!item.indexId && item.indexId !== 0">
            {{ row.treeName }}
          </div> -->
          <div class="dat-table-data">
            <span v-if="!row.dataList[index]?.editFlag"> {{ thousandSeparation(row.dataList[index]?.value) }}</span>
            <te-input
              v-else
              v-model="row.dataList[index].value"
              @blur="blurEvt(row.dataList[index])"
              @change="changeTargetVal(item.indexId, item.indexName, row.treeName, row.treeId, row.dataList[index])"
              v-inputFilter:number="precisionValue(item)"
              v-auto-focus
              v-auto-blur
            ></te-input>
            <span class="dat-table-edit" v-if="!row.dataList[index]?.editFlag" @click="editData(row.dataList[index])">
              <icon-edit-pen
            /></span>
          </div>
        </template>
      </te-table-column>
    </te-table>
    <no-data
      v-show="datService?.tableTitleList?.length === 0 && !datService.loading"
      :imgUrl="require('../../../../../assets/img/common/common-empty.svg')"
      :marginTop="20"
      :height="160"
    ></no-data>
    <te-pagination
      v-if=" !datService.loading"
      @size-change="datService.onPageSizeChange"
      @current-change="datService.onPageChange"
      :current-page="datService.pageNum"
      :page-sizes="datService.pageSizes"
      :page-size="datService.pageSize"
      layout="total, prev, pager, next, sizes, jumper"
      :total="datService.total"
    ></te-pagination>
  </div>
</template>

<script lang="ts" setup>
import { TeTable, TeTableColumn, TeInput, TePagination } from '@tiansu/element-plus';
import { datService } from '../../department-assessment-target.service';
import { IconEditPen } from '@arco-iconbox/vue-te';
import { IDataListItem, ITableHeaderData } from '../../department-assessment-target.api';
import { thousandSeparation } from '@/utils';
import { ref } from 'vue';

const oldTdData = ref(''); //记录编辑前的值
/**
 * 编辑数据
 * @param rowData
 */
const editData = (rowData: IDataListItem) => {
  rowData.editFlag = true;
  oldTdData.value = rowData.value ?? '';
};

/**
 * 限制数值精度
 * @param item
 */
const precisionValue = (item: ITableHeaderData) => {
  return { integral: 10, decimal: item.percent ? 2 : 4, negative: item.percent };
};

/**
 * 失去焦点
 * @param rowData
 */
const blurEvt = (rowData: IDataListItem) => {
  rowData.editFlag = false;
};

/**
 * 编辑指标值
 * @param indexId 指标id
 * @param indexName 指标名
 * @param treeName 节点名称
 * @param treeId 节点id
 * @param rowData 行数据
 */
const changeTargetVal = (
  indexId: number,
  indexName: string,
  treeName: string,
  treeId: number,
  rowData: IDataListItem,
) => {
  if (rowData.value === '-') {
    rowData.value = oldTdData.value;
    return;
  }
  const params = {
    treeId,
    indexId,
    indexName,
    treeName,
    energyCodeName: datService.energyCodeName,
    value: !rowData.value ? null : Number(rowData.value),
  };
  datService.updateTargetData(params);
};

/**
 * 自动获得焦点指令
 */
const vAutoFocus = {
  mounted: (el: HTMLInputElement) => {
    const ele = el.querySelector('input');
    ele?.focus();
  },
};

/**
 * 按enter键自动失去焦点指令;
 */
const vAutoBlur = {
  mounted: (el: HTMLInputElement) => {
    el.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        (event.target as HTMLInputElement).blur();
      }
    });
  },
};
</script>

<style lang="less" scoped>
.dat-table {
  width: 100%;
  height: 100%;
  &-data {
    position: relative;
    padding-right: 12px;
  }
  &-edit {
    position: absolute;
    right: 0;
    cursor: pointer;
  }
  .te-table td.te-table__cell > .cell > div {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
