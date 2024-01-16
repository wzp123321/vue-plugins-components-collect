<!--
 * @Author: yut
 * @Date: 2023-08-11 16:51:54
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 14:25:56
 * @Descripttion: 
-->
<template>
  <div class="hnm-list-search">
    <div class="hnm-list-search-left">
      <te-button type="primary" @click="onAdd">新增</te-button>
      <te-button :disabled="hlSearch.is_downloading" @click="hlSearch.download()">
        {{ hlSearch.is_downloading ? '正在下载' : '下载模板' }}
      </te-button>
      <te-button :disabled="hlSearch.is_importing" @click="onTemplateImport">
        {{ hlSearch.is_importing ? '正在导入' : '模板导入' }}
      </te-button>
    </div>
    <div class="hnm-list-search-right">
      <te-form :inline="true" :model="hlTable.pageForm" @submit.native.prevent>
        <te-form-item>
          <te-select
            v-model="hlTable.pageForm.energyCode"
            clearable
            :popper-append-to-body="false"
            placeholder="请选择能源类型"
            @change="hlTable.search"
          >
            <te-option
              v-for="(item, index) in hlTable.energyCodeList"
              :key="'status_' + index"
              :label="item.name"
              :value="item.code"
            ></te-option>
          </te-select>
        </te-form-item>
        <te-form-item>
          <te-input
            placeholder="户号"
            @input="inputSearch"
            maxlength="32"
            v-model="hlTable.pageForm.accountNumber"
            v-inputFilter:search
          >
            <template #prefix>
              <icon-search />
            </template>
          </te-input>
        </te-form-item>
        <te-form-item>
          <te-button @click="hlTable.search"><icon-refresh-right /></te-button>
        </te-form-item>
      </te-form>
    </div>

    <!-- 错误原因 -->
    <te-dialog
      :close-on-click-modal="false"
      class="import-dialog"
      v-model="hlSearch.importVisible"
      title="错误原因"
      width="800px"
      :before-close="hlSearch.errorDialogClose"
    >
      <te-table-v2 :data="hlSearch.errorDataSource" :height="480" :width="750" :columns="columns"> </te-table-v2>
    </te-dialog>
  </div>
</template>
<script lang="ts" setup>
import { IconRefreshRight, IconSearch } from '@arco-iconbox/vue-te';
import { ref, onMounted, h } from 'vue';
import hlSearch from './hnm-list-search.service';
import hlTable from '../hnm-list-table/hnm-list-table.service';
import hlUpdate from '../hnm-list-update/hnm-list-update.service';
import { EType, HLU_EHostingType } from '../hnm-list-update/hnm-list-update.api';
import { debounce } from 'lodash';

onMounted(async () => {
  try {
    await hlTable.init();
    hlTable.queryTableData();
  } catch (error) {
    hlTable.loading = false;
  }
});

const inputSearch = debounce((): void => {
  hlTable.search();
}, 300);

// 模板导入
const onTemplateImport = async () => {
  const res = await hlSearch.fileImport();
  if (res) {
    hlTable.queryTableData();
  }
};
//录入
const onAdd = async () => {
  hlUpdate.visible = true;
  await hlTable.queryEnergyCodeList();
  hlUpdate.queryHostingAreaList(hlTable.energyCodeList[0].code);
  hlUpdate.queryAssociatedNodeList(hlTable.energyCodeList.length > 0 ? hlTable.energyCodeList[0].code : '', '1');
  hlUpdate.type = EType.新增;
  hlUpdate.title = '新建户号';
  hlUpdate.formObj.houseNumber = '';
  hlUpdate.formObj.energyType = hlTable.energyCodeList[0].code ?? '';
  hlUpdate.formObj.hostingAreaName = '';
  hlUpdate.formObj.id = undefined;
  hlUpdate.formObj.hostingFlag = HLU_EHostingType.否;
  hlUpdate.formObj.hostingArea = '';
};

//虚拟表格列
const columns = ref<any[]>([
  {
    key: 'index',
    dataKey: 'index',
    title: '序号',
    width: 50,
    align: 'center',
    cellRenderer: ({ rowIndex }: { rowIndex: number }) => `${rowIndex + 1}`,
  },
  {
    key: 'position',
    dataKey: 'position',
    title: '模板位置',
    align: 'center',
    width: 350,
    showOverflowTooltip: 'true',
    cellRenderer: ({ cellData: position }) =>
      h('div', { class: 'hls-error-info', title: position ?? '-' }, { default: () => position ?? '-' }),
  },
  {
    key: 'detail',
    dataKey: 'detail',
    title: '详细信息',
    align: 'center',
    width: 350,
    showOverflowTooltip: 'true',
    cellRenderer: ({ cellData: detail }) =>
      h('div', { class: 'hls-error-info', title: detail ?? '-' }, { default: () => detail ?? '-' }),
  },
]);
</script>
<style lang="less" scoped>
.hnm-list-search {
  padding-bottom: var(--te-space-16);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .te-input,
  .te-select,
  .te-date-editor {
    width: 280px;
  }

  &-right {
    display: flex;
    flex-wrap: wrap;
    .te-form--inline .te-form-item {
      margin-right: var(--te-space-12);
    }
    .te-button {
      width: 32px;
      height: 32px;
    }
    .te-form-item {
      margin-bottom: 0;
    }
  }
  :deep(.hls-error-info) {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
