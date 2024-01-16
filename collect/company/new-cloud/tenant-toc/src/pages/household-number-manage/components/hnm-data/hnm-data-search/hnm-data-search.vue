<!--
 * @Author: yut
 * @Date: 2023-08-11 16:51:54
 * @LastEditors: yut
 * @LastEditTime: 2023-12-08 15:03:39
 * @Descripttion: 
-->
<template>
  <div class="hnm-data-search">
    <div class="hnm-data-search-left">
      <te-button type="primary" @click="onAdd">录入</te-button>
      <te-button :disabled="heButtonBar.is_downloading" @click="heButtonBar.show()">
        {{ heButtonBar.is_downloading ? '正在下载' : '下载模板' }}
      </te-button>
      <te-button :disabled="heButtonBar.is_importing" @click="onTemplateImport">
        {{ heButtonBar.is_importing ? '正在导入' : '模板导入' }}
      </te-button>
    </div>
    <div class="hnm-data-search-right">
      <te-form :inline="true" :model="heTable.pageForm" @submit.native.prevent>
        <te-form-item>
          <te-select
            v-model="heTable.pageForm.energyCode"
            clearable
            :popper-append-to-body="false"
            placeholder="请选择能源类型"
            @change="heTable.search"
          >
            <te-option
              v-for="(item, index) in heTable.energyCodeList"
              :key="'status_' + index"
              :label="item.name"
              :value="item.code"
            ></te-option>
          </te-select>
        </te-form-item>
        <te-form-item>
          <te-date-picker
            @change="heTable.search"
            v-model="heTable.pageForm.year"
            type="year"
            :clearable="false"
            placeholder="请选择年份"
          />
        </te-form-item>
        <te-form-item>
          <te-input
            placeholder="户号"
            maxlength="32"
            @input="inputSearch"
            v-model="heTable.pageForm.accountNumber"
            v-inputFilter:search
          >
            <template #prefix>
              <icon-search />
            </template>
          </te-input>
        </te-form-item>
        <te-form-item>
          <te-button @click="heTable.search"><icon-refresh-right /></te-button>
        </te-form-item>
      </te-form>
    </div>

    <!-- 模板下载 -->
    <te-dialog
      draggable
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="heButtonBar.visible"
      title="模板下载"
      width="540px"
      :before-close="heButtonBar.close"
    >
      <te-form label-width="60px">
        <te-form-item label="日期" prop="date">
          <te-date-picker
            :editable="false"
            v-model="heButtonBar.date"
            :disabled-date="heForm.disabledDataDate"
            type="monthrange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </te-form-item>
      </te-form>
      <template #footer>
        <te-button @click="heButtonBar.close">取消</te-button>
        <te-button primary @click="heButtonBar.download">确认</te-button>
      </template>
    </te-dialog>

    <!-- 错误原因 -->
    <te-dialog
      :close-on-click-modal="false"
      class="import-dialog"
      v-model="heButtonBar.importVisible"
      title="错误原因"
      width="800px"
      :before-close="heButtonBar.errorDialogClose"
    >
      <te-table-v2 :data="heButtonBar.errorDataSource" :height="480" :width="760" :columns="columns"> </te-table-v2>
    </te-dialog>
  </div>
</template>
<script lang="ts" setup>
import { IconRefreshRight, IconSearch } from '@arco-iconbox/vue-te';
import { ref, onMounted, h } from 'vue';
import heButtonBar from '../services/hnm-data-search.service';
import heTable from '../services/hnm-data-table.service';
import heForm from '../services/hnm-data-form.service';
import { debounce } from 'lodash';
onMounted(async () => {
  try {
    await heTable.init();
    heForm.energyCodeList = heTable.energyCodeList;
    heTable.query();
  } catch (error) {
    heTable.loading = false;
  }
});

const inputSearch = debounce((): void => {
  heTable.search();
}, 300);

/**
 * 模板导入
 */
const onTemplateImport = async () => {
  const res = await heButtonBar.fileImport();
  if (res) {
    heTable.query();
  }
};

/**
 * 录入
 */
const onAdd = () => {
  heForm.resetFormInAdd();
  heForm.show();
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
      h('div', { class: 'hds-error-info', title: position ?? '-' }, { default: () => position ?? '-' }),
  },
  {
    key: 'detail',
    dataKey: 'detail',
    title: '详细信息',
    align: 'center',
    width: 350,
    showOverflowTooltip: 'true',
    cellRenderer: ({ cellData: detail }) =>
      h('div', { class: 'hds-error-info', title: detail ?? '-' }, { default: () => detail ?? '-' }),
  },
]);
</script>
<style lang="less" scoped>
.hnm-data-search {
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
  :deep(.hds-error-info) {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
