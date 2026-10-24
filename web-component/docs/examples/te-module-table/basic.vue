<template>
  <div class="box">
    <div class="header" style="margin-bottom: 16px">
      <te-input
        v-model="tableListParams.searchValue"
        placeholder="请输入设备名称11"
      ></el-input>
      <te-button type="primary" @click="query()">查询</el-button>
      <te-button type="info" @click="reset()">重置</el-button>
      <ColSettingBtn
        class="btn"
        v-model="tableColumnData"
        :save-param="initColumnParam"
        :save-api="columnSaveApi"
      >
      </ColSettingBtn>
    </div>

    <te-module-table
      ref="tableRef"
      :request-api="getListApi"
      :initParam="tableListParams"
      :data-callback="dataCallback"
      :request-column-api="getColumnConfigApi"
      :initColumnParam="initColumnParam"
      :columnCallback="requestColumnCallBack"
      :page-save-api="pageSaveApi"
      :showSelectColumn="true"
      :showOperationColumn="true"
      :showIndexColumn="true"
      :showOperationColumnSpread="true"
      :showExpandColumn="true"
      :selectable="
        (row, index) => {
          return true;
        }
      "
      @selection-change="handleSelectionChanged"
    >
      <!-- 插槽自定义表格内容-->
      <template #devName="{ row }">
        <span v-if="row.devName && row.devName.length > 1" class="href-link">
          {{ row.devName }}
        </span>
        <span v-else>{{ row.devName }}</span>
      </template>

      <!-- 插槽自定义操作列 -->
      <template #operation="{ row }">
        <TeTableButtonGroup
          :row="row"
          :tableButton="setButton(row)"
        ></TeTableButtonGroup>
      </template>

      <template #code-title-suffi="{ scope }">
        <icon-folder style="margin-left: 10px" />
      </template>

      <template #expand-default="scope"> 这里是展开内容 </template>
    </te-module-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref } from 'vue';
import { TeModuleTable } from '@ts-web-package/components/lib/te-module-table';
import ColSettingBtn from '@ts-web-package/components/lib/te-module-table/src/components/ColSettingBtn.vue';
import TeTableButtonGroup from '@ts-web-package/components/lib/te-module-table/src/components/TeTableButtonGroup.vue';
import { ElButton } from 'element-plus';
import { IconFolder } from '@arco-iconbox/vue-te';
import axios from 'axios';

interface DataType {
  getListApi: any;
  getColumnConfigApi: any;
  pageSaveApi: any;
  columnSaveApi: any;
  initColumnParam: any;
  tableListParams: any;
  selectList: any;
  tableColumnData: any;
}
export default defineComponent({
  name: 'table-demo',
  components: {
    ElButton,
    TeModuleTable,
    ColSettingBtn,
    TeTableButtonGroup,
    IconFolder,
  },
  setup() {
    const service = axios.create({
      timeout: 60000,
    });
    const BASE =
      'http://192.168.50.174:7300/mock/6538c9813ceed90021bd37b9/sl/api/tms';
    const data = reactive<DataType>({
      getListApi: (params) => service.post(BASE + '/getTableList', params),
      getColumnConfigApi: (params) =>
        service.post(BASE + '/getColumnConfig', params),
      pageSaveApi: (params) => service.post(BASE + '/putPageSize', params),
      columnSaveApi: (params) =>
        service.post(BASE + '/putColumnDetail', params),
      initColumnParam: {
        tableId: '134',
      },
      tableListParams: {
        searchValue: '',
      },
      selectList: [],
      tableColumnData: [],
    });
    const tableRef = ref<any>(null);

    const query = () => {
      let params = {
        searchValue: data.tableListParams.searchValue,
      };
      Object.assign(data.tableListParams, params);
      tableRef.value.getTableList();
    };

    const reset = () => {
      data.tableListParams.searchValue = '';
      tableRef.value.clearSelection();
      tableRef.value.reset();
    };

    const dataCallback = (res: any) => {
      const data = res.data;
      if (data && data.data.rows && data.data.rows.length > 0) {
        res.rows = data.data.rows;
        res.total = data.data.total;
      } else {
        res.rows = [];
        res.total = 0;
      }
      return res;
    };

    const requestColumnCallBack = (backData: any) => {
      backData.forEach((item) => {
        item.width = '';
        if (item.label === '任务状态') {
          item.filterList = [
            {
              name: '待接单',
              id: 1,
            },
            {
              name: '待反馈',
              id: 2,
            },
            {
              name: '转单待审批',
              id: 3,
            },
            {
              name: '已完成',
              id: 4,
            },
            {
              name: '逾期关闭',
              id: 5,
            },
            {
              name: '手动关闭',
              id: 6,
            },
          ];
        }
      });
      data.tableColumnData = backData;
      return backData;
    };

    // 根据row动态设置展示的按钮
    const setButton = (row: any, buttons: any) => {
      if (row.orderStatus === '待接单') {
        return [
          {
            buttonColor: '#18bebb',
            buttonName: '查看',
            value: 'view',
            showBtnPop: true,
            pop: {
              cancel: '取消',
              confirm: '确认',
              tip: '确认操作操作当前数据吗？',
            },
          },
          {
            buttonColor: '#f5222d',
            buttonName: '接单',
            value: 'pick',
            showBtnPop: true,
            pop: {
              cancel: '取消',
              confirm: '确认',
              tip: '确认操作操作当前数据吗？',
            },
          },
          {
            buttonColor: '#f5222d',
            buttonName: '接单',
            value: 'pick',
          },
          {
            buttonColor: '#f5222d',
            buttonName: '接单',
            value: 'pick',
          },
          {
            buttonColor: '#f5222d',
            buttonName: '接单',
            value: 'pick',
          },
        ];
      } else {
        return [
          {
            buttonColor: '#18bebb',
            buttonName: '查看',
            value: 'view',
            showBtnPop: true,
            pop: {
              cancel: '取消',
              confirm: '确认',
              tip: '该该数据将无法恢复，确数据将无法恢复，确定要删除吗？',
            },
          },
          {
            buttonColor: '#ff6700',
            buttonName: '反馈',
            value: 'feedback',
          },
        ];
      }
    };

    const handleSelectionChanged = (val: any) => {
      data.selectList = val;
    };

    return {
      ...toRefs(data),
      tableRef,
      dataCallback,
      requestColumnCallBack,
      handleSelectionChanged,
      query,
      reset,
      setButton,
    };
  },
});
</script>
<style lang="less" scoped>
.box {
  height: 600px;
  .header {
    display: flex;
    .te-input {
      width: 300px;
      margin-right: 20px;
    }
    .btn {
      flex: 1;
      text-align: right;
    }
  }
}

.href-link {
  color: #1890ff;
  cursor: pointer;
}
</style>
