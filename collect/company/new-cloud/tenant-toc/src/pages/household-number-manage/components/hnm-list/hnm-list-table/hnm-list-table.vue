<!--
 * @Author: yut
 * @Date: 2023-08-11 16:57:50
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 14:49:36
 * @Descripttion: 
-->
<template>
  <div class="hnm-list-table">
    <te-table :data="hlTable.dataSource" v-loading="hlTable.loading">
      <te-table-column type="index" label="序号" width="80" align="center">
        <template #default="scope">
          <span>{{ scope.$index + (hlTable.pageForm.pageNum - 1) * hlTable.pageForm.pageSize + 1 }} </span>
        </template>
      </te-table-column>
      <te-table-column prop="accountNumber" align="center" label="户号" show-overflow-tooltip />
      <te-table-column prop="energyName" align="center" label="能源类型" show-overflow-tooltip />
      <te-table-column prop="treeName" align="center" label="关联节点" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.treeName ? scope.row.treeName : '--' }}
        </template>
      </te-table-column>
      <te-table-column v-if="hlUpdate.areaList.length" prop="hostingAreaName" align="center" label="所属托管区域">
        <template #default="scope">
          {{ scope.row.hostingAreaName ? scope.row.hostingAreaName : '--' }}
        </template>
      </te-table-column>
      <!-- 是否平托 -->
      <te-table-column v-if="props.configureHostFlag" prop="hostingFlag" align="center" label="是否平托">
        <template #default="scope">
          {{ scope.row.hostingFlag + '' === HLU_EHostingType.是 + '' ? '是' : '否' }}
        </template>
      </te-table-column>
      <te-table-column label="操作" align="center">
        <template #default="scope">
          <te-button type="primary" link @click="edit(scope.row)">编辑</te-button>
          <te-popconfirm title="确认删除该条数据吗?" width="180" @confirm="deleteHouseholdNumber(scope.row.id)">
            <template #reference>
              <te-button type="danger" link>删除</te-button>
            </template>
          </te-popconfirm>
        </template>
      </te-table-column>
    </te-table>
    <te-pagination
      v-show="hlTable.total > 0 && !hlTable.loading"
      @size-change="hlTable.onPageSizeChange"
      @current-change="hlTable.onPageChange"
      :current-page="hlTable.pageForm.pageNum"
      :page-sizes="hlTable.pageSizeList"
      :page-size="hlTable.pageForm.pageSize"
      layout="total, prev, pager, next, sizes, jumper"
      :total="hlTable.total"
    ></te-pagination>
  </div>
</template>
<script lang="ts" setup>
import hlTable from './hnm-list-table.service';
import hlUpdate from '../hnm-list-update/hnm-list-update.service';
import { householdNumberListVO } from './hnm-list-table.api';
import { EType, HLU_EHostingType } from '../hnm-list-update/hnm-list-update.api';

// props
const props = defineProps({
  configureHostFlag: {
    type: Boolean,
    default: false,
  },
});

const edit = (row: householdNumberListVO) => {
  hlTable.queryEnergyCodeList();
  hlUpdate.queryHostingAreaList(row.energyCode ?? '');
  hlUpdate.queryAssociatedNodeList(row.energyCode, '1').then(() => {
    hlUpdate.formObj.associatedNode = row.treeId ? [row.treeId] : [];
  });
  hlUpdate.formObj.houseNumber = row.accountNumber;
  hlUpdate.formObj.energyType = row.energyCode;
  hlUpdate.formObj.hostingAreaName = row.hostingAreaName;
  hlUpdate.formObj.id = row.id;
  hlUpdate.formObj.hostingFlag = [HLU_EHostingType.否 + '', HLU_EHostingType.是 + ''].includes(row.hostingFlag)
    ? row.hostingFlag
    : HLU_EHostingType.否;
  hlUpdate.formObj.hostingArea = row.hostingAreaId ? row.hostingAreaId.toString() : '';
  hlUpdate.visible = true;
  hlUpdate.title = '编辑户号';
  hlUpdate.type = EType.编辑;
};

const deleteHouseholdNumber = (id: number) => {
  hlTable.deleteHouseholdNumber(id);
};
</script>
<style lang="less" scoped>
.hnm-list-table {
  width: 100%;
  height: 100%;
}
</style>
