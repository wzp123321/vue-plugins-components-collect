<template>
  <div class="log-management">
    <page-container title="日志管理">
      <template v-slot:pageSearch>
        <!-- 头部 -->
        <el-form :inline="true" :model="formInline" class="demo-form-inline" @submit.native.prevent>
          <el-form-item>
            <el-input
              placeholder="请输入操作日志或归属模块"
              v-model.trim="formInline.search"
              v-inputFilter:search
              @keyup.enter="onSearch"
              style="width: 200px; height: 36px"
              suffix-icon="el-icon-search"
            ></el-input>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-select v-model="formInline.tenantCode" style="width: 160px" placeholder="请选择项目名称">
              <el-option
                v-for="(item, index) in tenantCodeList"
                :key="index"
                :label="item.name"
                :value="item.code"
                :fit-input-width="true"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="formInline.type" style="width: 160px" placeholder="请选择类型">
              <el-option
                v-for="(item, index) in typeList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="formInline.date"
              type="daterange"
              :disabledDate="onDisableDateCb"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button class="resetBtn" @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:pageContent>
        <div class="lm-table-title">
          日志列表
          <el-button v-if="tableData.length > 0" type="primary" @click="downLoad">{{
            downLoadLoading ? '正在导出' : '导出'
          }}</el-button>
        </div>
        <div v-loading="loading" class="lm-table">
          <el-table
            v-if="!loading"
            ref="multipleTable"
            :data="tableData"
            :stripe="lightOrDark"
            style="width: 100%"
            :default-sort="{ prop: `${sortNameTable}`, order: `${sortCode}` }"
            sort-orders="['descending','ascending','descending']"
            @selection-change="handleSelectionChange"
            @sort-change="sortChange"
          >
            <el-table-column type="selection" width="65" />
            <el-table-column prop="index" label="序号" width="68" align="center">
              <template #default="scope">
                {{ (pageNum - 1) * pageSize + scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="tenantName" label="项目名称" show-overflow-tooltip width="250" align="center">
              <template #default="scope">
                {{ scope.row.tenantName === null || scope.row.tenantName === '' ? '--' : scope.row.tenantName }}
              </template>
            </el-table-column>
            <el-table-column prop="businessName" label="归属模块" show-overflow-tooltip width="190" align="center">
              <template #default="scope">
                {{ scope.row.businessName === null || scope.row.businessName === '' ? '--' : scope.row.businessName }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" show-overflow-tooltip width="120" align="center">
              <template #default="scope">
                {{ scope.row.operator === null || scope.row.operator === '' ? '--' : scope.row.operator }}
              </template>
            </el-table-column>
            <el-table-column prop="remoteIp" label="客户端IP" show-overflow-tooltip width="170" align="center">
              <template #default="scope">
                {{ scope.row.remoteIp === null || scope.row.remoteIp === '' ? '--' : scope.row.remoteIp }}
              </template>
            </el-table-column>
            <el-table-column prop="operationName" label="类型" show-overflow-tooltip width="120" align="center">
              <template #default="scope">
                {{
                  scope.row.operationName === null || scope.row.operationName === '' ? '--' : scope.row.operationName
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="operationTime"
              label="生成时间"
              show-overflow-tooltip
              width="190"
              align="center"
              sortable
            >
              <template #default="scope">
                {{
                  scope.row.operationTime === null || scope.row.operationTime === '' ? '--' : scope.row.operationTime
                }}
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="操作日志" show-overflow-tooltip align="center" min-width="200">
              <template #default="scope">
                {{ scope.row.comment === null || scope.row.comment === '' ? '--' : scope.row.comment }}
              </template>
            </el-table-column>
            <el-table-column prop="address" label="操作" width="140" align="center">
              <template #default="scope">
                <button
                  v-if="scope.row.operationName === '导入'"
                  :disabled="scope.row.attachmentIds == null ? true : false"
                  class="details operate-span mr16"
                  @click="down(scope.row.attachmentIds)"
                >
                  下载附件
                </button>
                <button
                  v-else
                  :disabled="scope.row.detailFlag == 1 ? false : true"
                  class="details operate-span mr16"
                  @click="ondetails(scope.row)"
                >
                  详细信息
                </button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="!loading && total > 0"
            :pager-count="7"
            :current-page="pageNum"
            :page-sizes="pageSizes"
            @size-change="onPageSizeChange"
            @current-change="onCurrentChange"
            :page-size="pageSize"
            layout="total, prev, pager, next, sizes, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </template>
    </page-container>
    <Log :dialogLog="dialogLog" :key="num" :logDetailsList="logDetailsList" :operationName="operationName"></Log>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { ElTable } from 'element-plus';
import { useStore } from 'vuex';
import { ElMessageBox } from 'element-plus';
// config
import { pageSizes } from '@/config/index';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';

// services
import logManagement from '../log-management/services/log-management';
import { CommonObject, logDetailsListType, getListUrlType } from './services/log-management.api';
import CommonService from './constant/index';
import Log from './components/lm-log-dialog.vue';
import { FGetCookie, FSetCookie } from '@/core/token';

interface formInlineType {
  search: string;
  homeModule: string;
  type: string;
  tenantCode: string;
  date: Date[];
}
interface rowsType {
  createTime: string;
  description: string;
  id: number;
  loginName: string;
  moduleCode: string;
  moduleName: string;
  operation: string;
  operationText: string;
  templateCode: number;
}
interface tenantCodeObj {
  code: string;
  name: string;
}

export default defineComponent({
  name: 'logManagement',
  components: { Log },
  setup() {
    const store = useStore();
    const multipleTable = ref(ElTable);
    const { proxy } = useCurrentInstance();
    const objectId = ref<string>('');
    let formInline = reactive<formInlineType>({
      search: '',
      homeModule: '',
      tenantCode: '',
      type: '',
      date: [new Date(), new Date()],
    });
    let abnormal = ref<boolean>(true);
    let loading = ref<boolean>(true);
    let sortAsc = ref<boolean>(false);
    let downLoading: boolean = false;
    const sortNameTable = ref<string>('operationTime'); // 排序字段
    const sortCode = ref<string>('descending'); // 升序降序
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    let pageNum = ref<number>(1);
    let pageSize = ref<number>(pageSizes[0]);
    let total = ref<number>(0);
    const tableData = ref<CommonObject[]>([]);
    //项目名称下拉
    const tenantCodeList = ref<tenantCodeObj[]>([]);
    let typeList = [
      { code: '', name: '所有类型' },
      { code: '新增', name: '新增' },
      { code: '删除', name: '删除' },
      { code: '查询', name: '查询' },
      { code: '修改', name: '修改' },
      { code: '导入', name: '导入' },
    ]; // 类型
    const downLoadLoading = ref(false);
    let handleSelectArr: number[] = [];
    let logDetailsList = ref<logDetailsListType[]>([]);
    const dialogLog = ref<boolean>(false);
    const num = ref<number>(0);
    let operationName = ref<string>('');
    // 列表中多选
    const handleSelectionChange = (value: rowsType[]) => {
      handleSelectArr = [];
      if (value.length) {
        handleSelectArr = value.map((item: any) => {
          return item.id;
        });
      }
    };
    // 搜索
    const onSearch = () => {
      handleSelectArr = [];
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      getList();
    };
    // 重置
    const onReset = () => {
      FSetCookie('toc-objectId', '');
      objectId.value = '';

      handleSelectArr = [];
      formInline.search = '';
      formInline.homeModule = '';
      formInline.type = '';
      formInline.tenantCode = '';
      formInline.date = [new Date(), new Date()];
      sortAsc.value = false;
      sortCode.value = 'descending';
      sortNameTable.value = 'operationTime';
      onSearch();
    };

    const down = (val: string) => {
      if (downLoading) {
        return;
      }
      downLoading = true;
      CommonService.getFileStreamDownload(
        '',
        `/log/downloadLogAttachmentFlag/${val}`,
        '下载',
        () => {
          downLoading = false;
        },
        () => {
          downLoading = false;
        },
      );
    };

    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        let obj: getListUrlType = {
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          orderByTime: sortAsc.value,
          keyword: formInline.search,
          tenantCode: formInline.tenantCode,
          operationName: formInline.type,
          startTime:
            formInline.date?.length && formInline.date?.[0]
              ? formatDate(formInline.date[0], 'yyyy-MM-dd') + ' 00:00'
              : '',
          endTime:
            formInline.date?.length && formInline.date?.[1]
              ? formatDate(formInline.date[1], 'yyyy-MM-dd') + ' 23:59'
              : '',
        };
        if (objectId.value) {
          obj = {
            ...obj,
            objectId: objectId.value,
          };
        }

        const res = await logManagement.getListUrl(obj);
        if (res && res.code === 200) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          abnormal.value = false;
          loading.value = false;
          // return proxy.$message.error(res.message);
        }
      } catch (error: any) {
        loading.value = false;
        abnormal.value = false;
        // return proxy.$message.error(error.message);
      }
    };
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      handleSelectArr = [];
      pageNum.value = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = value;
      handleSelectArr = [];
      getList();
    };

    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };

    // 导出
    const downLoad = () => {
      let obj: any = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        orderByTime: sortAsc.value,
        keyword: formInline.search,
        tenantCode: formInline.tenantCode,
        operationName: formInline.type,
        startTime:
          formInline.date?.length && formInline.date?.[0]
            ? formatDate(formInline.date[0], 'yyyy-MM-dd') + ' 00:00'
            : '',
        endTime:
          formInline.date?.length && formInline.date?.[1]
            ? formatDate(formInline.date[1], 'yyyy-MM-dd') + ' 23:59'
            : '',
        logIdList: handleSelectArr,
      };
      if (objectId.value) {
        obj = {
          ...obj,
          objectId: objectId.value,
        };
      }
      console.log('------------------------', obj);
      if (obj.logIdList.length === 0) {
        ElMessageBox.confirm('是否全部导出？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            obj.logIdList = [];
            downloadAsync(obj, '/log/exportExcel');
          })
          .catch(() => {});
      } else {
        downloadAsync(obj, '/log/exportExcel');
      }
    };
    // 导出方法
    const downloadAsync = async (params: any, url: string) => {
      if (downLoadLoading.value) {
        return;
      }
      console.log(params);
      downLoadLoading.value = true;
      await CommonService.getFileStreamDownload(
        params,
        url,
        '导出',
        () => {
          downLoadLoading.value = false;
        },
        () => {
          downLoadLoading.value = false;
        },
      );
    };
    // 排序触发事件
    const sortChange = (value: any) => {
      // console.log(value, 'value');
      if (value.order === 'ascending') {
        sortAsc.value = true;
        getList();
      } else if (value.order === 'descending') {
        sortAsc.value = false;
        getList();
      } else {
        // try {
        //   if (sortAsc.value === true) {
        //     multipleTable.value.sort('operationTime', 'ascending');
        //   } else {
        //     multipleTable.value.sort('operationTime', 'descending');
        //   }
        // } catch (error) {
        //   // console.log('error----', error);
        // }
      }
      sortCode.value = value.order;
    };
    // 详情
    const ondetails = async (val: any) => {
      try {
        operationName.value = val.operationName;
        let form: any = new FormData(); // FormData 对象
        form.append('operationId', val.id);
        const res = await logManagement.queryDetailsLog(form);
        if (res && res.code === 200) {
          logDetailsList.value = res.data || [];
          dialogLog.value = true;
          num.value++;
        } else {
          dialogLog.value = false;
        }
      } catch (error) {
        dialogLog.value = false;
      }
    };
    onMounted(async () => {
      objectId.value = FGetCookie('toc-objectId') ?? '';
      if (objectId.value) {
        formInline.date = [];
      }
      FSetCookie('toc-objectId', '');
      const res = await logManagement.queryTenantCodeList();
      if (res.code === 200) {
        res.data.unshift({
          code: '',
          name: '全部',
        });
        tenantCodeList.value = res.data;
      }
      await onSearch();
    });
    return {
      formInline,
      abnormal,
      tenantCodeList,
      tableData,
      lightOrDark,
      loading,
      pageNum,
      pageSize,
      total,
      pageSizes,
      multipleTable,
      handleSelectArr,
      logDetailsList,
      typeList,
      downLoadLoading,
      dialogLog,
      num,
      sortAsc,
      sortCode,
      sortNameTable,
      operationName,
      onSearch,
      onReset,
      handleSelectionChange,
      getList,
      onPageSizeChange,
      onCurrentChange,
      onDisableDateCb,
      downLoad,
      sortChange,
      ondetails,
      down,
    };
  },
});
</script>
<style lang="less" scoped>
.log-management {
  min-width: 1472px;
  height: 100%;

  :deep(.tenant-pagecontainer__detail-content) {
    display: flex;
    flex-direction: column;

    .lm-table {
      flex: 1 1 auto;
    }
  }
  .resetBtn {
    background-color: #fff !important;
    &:hover {
      border-color: #40a9ff !important;
      color: #40a9ff;
      background-color: #fff !important;
    }
    &:active {
      border-color: #096dd9 !important;
      color: #096dd9;
      background-color: #fff !important;
    }
  }
  .text {
    white-space: nowrap !important;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .lm-table-title {
    font-weight: 700;
    color: rgba(0, 0, 0, 0.85);
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    margin: 16px 0;
    &::before {
      content: '';
      border-left: solid 4px rgba(24, 144, 255, 1);
      margin-right: 8px;
    }
    button {
      float: right;
    }
  }
  .details {
    color: var(--el-color-primary);
    cursor: pointer;
    background-color: transparent;
    border: 0px;
  }
  :deep(.el-input--mini .el-input__inner) {
    height: 36px;
  }
  :deep(.el-range-editor--mini.el-input__inner) {
    height: 36px;
  }
  :deep(.el-input--mini .el-input__inner) {
    font-size: 14px;
  }
  :deep(.el-date-editor:not(.is-disabled) input) {
    font-size: 14px;
  }
}
.log-management button:disabled,
.log-management [disabled]:not([disabled='false']) {
  color: rgba(0, 0, 0, 0.25) !important;
  cursor: not-allowed;
}
</style>
