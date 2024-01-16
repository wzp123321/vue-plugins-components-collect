import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { ElTable } from 'element-plus';
import { ElMessageBox } from 'element-plus';
import { useStore } from 'vuex';
// service
import reportManagement from './services/report-management.service';
// services
import CommonService from '@/services/common/common.service';
// config
import { REPORT_MANAGEMANT } from '@/config/enum';
import { pageSizes } from '@/config/config';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import url from '@/api/api-url';
import UploadDialod from './components/rm-upload-dialog.vue';

interface formInlineType {
  search: string;
  source: string;
  type: string;
  date: [Date, Date];
}
interface rowsType {
  reportType: string;
  reportTypeText: string;
  reportName: string;
  createTime: string | null;
  sourceType: string;
  sourceTypeText: string;
  updateTime: string | null;
  id: number;
  generateTime: string;
  fileId: number;
}
interface type {
  code: string;
  name: string;
}
export default defineComponent({
  name: 'reportManagement',
  components: { UploadDialod },
  setup() {
    const store = useStore();
    const multipleTable = ref(ElTable);
    const { proxy } = useCurrentInstance();
    const formInline = reactive<formInlineType>({
      search: '',
      source: '',
      type: '',
      date: [new Date(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), new Date()],
    });
    const abnormal = ref<boolean>(true);
    const loading = ref<boolean>(true);
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizes[0]);
    const total = ref<number>(0);
    const tableData = ref<reportManagement.CommonObject[]>([]);
    const sourceList = ref<type[]>([]); // 归属地
    const typeList = ref<type[]>([]); // 类型
    const dialogAdd = ref<boolean>(false);
    const nums = ref(1);
    const sortName = ref<string>('create_time');
    const tableSortName = ref<string>('');
    const sortCode = ref<string>('');
    const reportDownLoadLoading = ref(false);

    const handleSelectArr = ref<number[]>([]);
    // 列表中多选
    const handleSelectionChange = (value: rowsType[]) => {
      handleSelectArr.value = [];
      if (value.length) {
        handleSelectArr.value = value.map((item: any) => {
          return item.id;
        });
      }
    };
    // 搜索
    const onSearch = () => {
      if (formInline.date === null) {
        return proxy.$message.error('请选择日期！');
      }
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      formInline.source = '';
      formInline.type = '';
      formInline.date = [new Date(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), new Date()];
      sortCode.value = '';
      tableSortName.value = '';
      handleSelectArr.value = [];
      onSearch();
    };

    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          reportName: formInline.search,
          sourceType: formInline.source,
          reportType: formInline.type,
          startTime: formatDate(formInline.date[0], 'yyyy-MM-dd'),
          endTime: formatDate(formInline.date[1], 'yyyy-MM-dd'),
          orders: [
            {
              asc: sortCode.value === 'ascending' ? true : false,
              column: `${sortName.value}`,
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
        };
        // console.log(sortName.value, 'obj');
        const res = await reportManagement.getListUrl(obj);
        // console.log(res, '报告报表');
        if (res.code === 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          loading.value = false;
          abnormal.value = false;
          //   return proxy.$message.error(res.message);
        }
      } catch (error) {
        loading.value = false;
        abnormal.value = false;
        // console.log('error------------', error);
      }
    };
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = Math.floor(value);
      getList();
    };

    // 批量删除
    const deleteAsync = () => {
      if (handleSelectArr.value.length === 0) {
        proxy.$message.warning('请勾选要批量删除的报告');
        return;
      }
      ElMessageBox.confirm('是否删除选中项？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteItemAsync(handleSelectArr.value);
        })
        .catch((error: Error) => {
          console.log('error----------', error);
        });
    };

    // 删除
    const deleteItemAsync = async (params: any) => {
      try {
        const obj = {
          operationIdList: params,
        };
        const res = await reportManagement.deleteUser(obj);
        if (res && res?.code === 200) {
          proxy.$message.success(res.message || '删除成功！');
          getList();
          handleSelectArr.value = [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res?.message || '删除失败！');
          }
        }
      } catch (error) {
        proxy.$message.error('删除失败！');
      }
    };

    // 获取来源
    const getHomeModule = async () => {
      try {
        const res = await CommonService.getDictionaryData(REPORT_MANAGEMANT.SOURCE_TYPE);
        if (res.code === 200 && res.success) {
          sourceList.value = res.data || [];
          sourceList.value.unshift({
            code: '',
            name: '全部',
          });
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取来源失败');
          }
        }
      } catch (error) {
        console.log('error------------', error);
      }
    };

    // 获取类型
    const getType = async () => {
      try {
        const res = await CommonService.getDictionaryData(REPORT_MANAGEMANT.REPORT_TYPE);
        if (res.code === 200 && res.success) {
          typeList.value = res.data || [];
          typeList.value.unshift({
            code: '',
            name: '全部',
          });
        } else {
          proxy.$message.error(res.message || '获取类型失败');
        }
      } catch (error) {
        console.log('error------------', error);
      }
    };

    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };

    // 批量导出
    const downloadBatchAsync = () => {
      if (handleSelectArr.value.length === 0) {
        proxy.$message.error('请至少选择一个文件下载！');
        return;
      }
      const obj = {
        operationIdList: handleSelectArr.value,
      };
      downloadAsync(obj, url.reportManagement.downloadExcelReportData, '批量下载');
    };

    // 导出
    const downLoad = (params: any) => {
      downloadAsync(params.fileId, url.reportManagement.downloadItemExcelReportData, '下载');
    };

    // 导出方法
    const downloadAsync = async (params: any, url: string, message: string) => {
      if (reportDownLoadLoading.value) {
        return;
      }
      reportDownLoadLoading.value = true;
      await CommonService.getFileStreamDownload(
        params,
        url,
        message,
        () => {
          handleSelectArr.value = [];
          reportDownLoadLoading.value = false;
        },
        () => {
          reportDownLoadLoading.value = false;
        },
      );
    };
    // 上传
    const uploadAsync = () => {
      dialogAdd.value = true;
      nums.value++;
    };
    // 上传成功
    const onUploaddOK = () => {
      dialogAdd.value = false;
      getList();
    };
    // 排序触发事件
    const sortChange = (value: any) => {
      if (value.prop === 'createTime') {
        sortName.value = 'create_time';
        tableSortName.value = 'createTime';
      } else if (value.prop === 'reportType') {
        sortName.value = 'report_type';
        tableSortName.value = 'reportType';
      } else if (value.prop === 'sourceType') {
        sortName.value = 'source_type';
        tableSortName.value = 'sourceType';
      }
      sortCode.value = value.order;
      getList();
    };

    onMounted(async () => {
      await onSearch();
      await getHomeModule();
      await getType();
    });
    return {
      formInline,
      abnormal,
      tableData,
      lightOrDark,
      loading,
      pageNum,
      pageSize,
      total,
      pageSizes,
      multipleTable,
      handleSelectArr,
      sourceList,
      typeList,
      onSearch,
      onReset,
      handleSelectionChange,
      getList,
      dialogAdd,
      nums,
      sortName,
      sortCode,
      tableSortName,
      reportDownLoadLoading,
      onPageSizeChange,
      onCurrentChange,
      onDisableDateCb,
      downLoad,
      downloadBatchAsync,
      sortChange,
      deleteItemAsync,
      deleteAsync,
      uploadAsync,
      onUploaddOK,
    };
  },
});
