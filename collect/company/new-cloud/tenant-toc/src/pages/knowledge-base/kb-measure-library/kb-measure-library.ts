import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';

// utils
import useCurrentInstance from '@/utils/use-current-instance';
import message from '@/utils/message';

// config
import { pageSizesArray } from '@/config/index';

// service
import CommonService from '@/service/pkg/index';

import { DicParams, noParamsDownload } from './constant/index';
import measureLibrary from './service/kb-measure-library.services';
import MlAddEditDetailsDialog from './compotents/kb-ml-add-edit-details-dialog.vue';

interface FormInlineType {
  measuresName: string;
  measuresCode: string;
  system: string;
  measuresStatus: string;
  systemList: MeasureLibrary.type[];
  measureStatusList: MeasureLibrary.type[];
}

interface TableType {
  loading: boolean;
  tableData: MeasureLibrary.tableDataSourceVO[];
  pageNum: number;
  pageSize: number;
  total: number;
}
interface DialogType {
  num: number;
  isType: number;
  rows: MeasureLibrary.tableDataSourceVO | null;
  systemList: MeasureLibrary.type[];
  measureStatusList: MeasureLibrary.type[];
  executionCycleList: MeasureLibrary.type[];
}

interface ButtonType {
  exportLoading: boolean;
  uploadLoading: boolean;
  downLoadLoading: boolean;
  measureCode: string;
  measureName: string;
  measureStatus: string;
  systemId: string;
  exportUrl: string;
  downLoadUrl: string;
}

interface ErrorDialog {
  errorDataList: MeasureLibrary.errorDataListType[];
  importErrorVisible: boolean;
}

export default defineComponent({
  name: 'MeasureLibrary',
  components: { MlAddEditDetailsDialog },
  setup() {
    const { proxy } = useCurrentInstance();
    const clearFile = ref(); //获取导入input框ref
    let fileName: MeasureLibrary.fileType; //文件名称
    /**
     * 头部搜索表单
     * @param measuresName 措施名称
     * @param measuresCode 措施编码
     * @param system 所属系统
     * @param measuresStatus 措施状态
     */
    const formInline = reactive<FormInlineType>({
      measuresName: '',
      measuresCode: '',
      system: '',
      measuresStatus: '',
      systemList: [],
      measureStatusList: [],
    });
    /**
     * 表格
     * @param loading 表格loading
     * @param tableData 表格数据
     */
    const tableContentType = reactive<TableType>({
      loading: true,
      tableData: [],
      pageNum: 1,
      pageSize: pageSizesArray[0],
      total: 0,
    });
    /**
     * 新增编辑详情弹框
     * @param num 用于在子组件监听
     * @param isType 弹框类型 1为新增弹框 2为编辑弹框 3为详情弹框
     * @param rows 编辑时回显数据
     * @param systemList 所属系统数据
     * @param measureStatusList 措施状态数据
     * @param executionCycleList 建议执行周期数据
     */
    const dialogType = reactive<DialogType>({
      num: 0,
      isType: 1,
      rows: null,
      systemList: [],
      measureStatusList: [],
      executionCycleList: [],
    });

    /**
     * 导出导入下载按钮
     * @param exportLoading  导出loading
     * @param uploadLoading  导入loading
     * @param downLoadLoading  下载loading
     */
    const buttonType = reactive<ButtonType>({
      exportLoading: false,
      uploadLoading: false,
      downLoadLoading: false,
      measureCode: '',
      measureName: '',
      measureStatus: '0',
      systemId: '0',
      exportUrl: '/energyManager/exportExcelEnergyManagerMeasure',
      downLoadUrl: '/energyManager/downloadExcelEnergyManagerMeasureTemplate',
    });

    /**
     * 导入异常弹框
     * @param errorDataList  异常数据
     * @param importErrorVisible  弹框显示与隐藏
     */
    const uploadErrorDialog = reactive<ErrorDialog>({
      errorDataList: [],
      importErrorVisible: false,
    });

    const onPageSizeChange = (value: number) => {
      tableContentType.pageSize = value;
      tableContentType.pageNum = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      tableContentType.pageNum = value;
      getList();
    };

    // 获取所属系统
    const querySystem = async () => {
      try {
        const res = await CommonService.queryDictionaryListByType(DicParams.MEASURE_SYSTEM_ID);
        if (res && res.code === 200 && res.success) {
          dialogType.systemList = res.data || [];
          if (res.data.length > 0) {
            formInline.systemList = [{ code: '0', name: '全部' }, ...dialogType.systemList];
            formInline.system = '0';
          } else {
            formInline.measureStatusList = [];
            formInline.system = '';
          }
        } else {
        }
      } catch (error) {}
    };

    // 措施状态
    const queryMeasureStatus = async () => {
      try {
        const res = await CommonService.queryDictionaryListByType(DicParams.MEASURE_STATUS);
        if (res && res.code === 200 && res.success) {
          dialogType.measureStatusList = res.data || [];
          if (res.data.length > 0) {
            formInline.measureStatusList = [{ code: '0', name: '全部' }, ...dialogType.measureStatusList];
            formInline.measuresStatus = '0';
          } else {
            formInline.measureStatusList = [];
            formInline.measuresStatus = '';
          }
        } else {
        }
      } catch (error) {}
    };

    // 建议执行周期数据
    const queryExecutionCycle = async () => {
      try {
        const res = await CommonService.queryDictionaryListByType(DicParams.MEASURE_EXECUTION_CYCLE);
        if (res && res.code === 200 && res.success) {
          dialogType.executionCycleList = res.data || [];
        } else {
        }
      } catch (error) {}
    };

    // 搜索
    const onSearch = () => {
      tableContentType.pageNum = 1;
      tableContentType.pageSize = pageSizesArray[0];
      buttonType.measureCode = formInline.measuresCode;
      buttonType.measureName = formInline.measuresName;
      buttonType.measureStatus = formInline.measuresStatus;
      buttonType.systemId = formInline.system;
      getList();
    };

    // 重置
    const onReset = () => {
      formInline.measuresName = '';
      formInline.measuresCode = '';
      formInline.system = formInline.systemList.length > 0 ? '0' : '';
      formInline.measuresStatus = formInline.measureStatusList.length > 0 ? '0' : '';
      onSearch();
    };

    // 获取表格数据
    const getList = async () => {
      try {
        tableContentType.loading = true;
        const obj = {
          measureCode: formInline.measuresCode,
          measureName: formInline.measuresName,
          measureStatus: formInline.measuresStatus,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: tableContentType.pageNum,
          pageSize: tableContentType.pageSize,
          searchCount: true,
          systemId: formInline.system,
        };
        const res = await measureLibrary.getListUrl(obj);
        if (res.code == 200 && res.success) {
          tableContentType.loading = false;
          tableContentType.tableData = res.data.list || [];
          tableContentType.total = res.data.total;
        } else {
          return proxy.$message.error(res.message);
        }
      } catch (error) {
        console.log('error------------', error);
      } finally {
        tableContentType.loading = false;
      }
    };

    // 新增按钮事件
    const onAdd = () => {
      dialogType.num++;
      dialogType.rows = null;
      dialogType.isType = 1;
    };

    // 详情
    const onDetails = (item: MeasureLibrary.tableDataSourceVO) => {
      dialogType.num++;
      dialogType.rows = item;
      dialogType.isType = 3;
    };

    // 编辑
    const onBlUpdate = (item: MeasureLibrary.tableDataSourceVO) => {
      dialogType.num++;
      dialogType.rows = item;
      dialogType.isType = 2;
    };

    //  删除
    const onBlDelete = async (id: number) => {
      await measureLibrary
        .deleteUrl(id)
        .then((res: any) => {
          if (res && res.code == 200 && res.success) {
            getList();
            return proxy.$message.success('删除成功');
          } else {
            return proxy.$message.error('删除失败');
          }
        })
        .catch((error: Error) => {
          console.log('error----------', error);
        });
    };

    // 导出按钮事件
    const onExport = async () => {
      if (buttonType.exportLoading) {
        return;
      }
      buttonType.exportLoading = true;
      const obj = {
        measureCode: buttonType.measureCode,
        measureName: buttonType.measureName,
        measureStatus: buttonType.measureStatus,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: tableContentType.pageNum,
        pageSize: tableContentType.pageSize,
        searchCount: true,
        systemId: buttonType.systemId,
      };

      await CommonService.getFileStreamDownload(
        obj,
        buttonType.exportUrl,
        '导出',
        () => {
          buttonType.exportLoading = false;
        },
        () => {
          buttonType.exportLoading = false;
        }
      );
    };

    // 导入按钮事件 自动触发点击input框
    const onUpload = () => {
      clearFile.value.dispatchEvent(new MouseEvent('click'));
    };

    // 打开文件资源 选择文件
    const getFile = async (event: any) => {
      fileName = event.target.files[0];
      if (fileName != undefined) {
        const file_typename = fileName.name.substring(fileName.name.lastIndexOf('.'));
        if (file_typename === '.xlsx') {
          importData(fileName);
        } else {
          alert('请选择正确的文件类型！');
        }
      }
    };

    // 导入方法
    const importData = async (params: MeasureLibrary.fileType) => {
      if (buttonType.uploadLoading) {
        return;
      }
      buttonType.uploadLoading = true;
      const messageInstance = message.loading('正在导入');
      try {
        const form: any = new FormData(); // FormData 对象
        form.append('file', params); // 文件对象
        const res = await measureLibrary.upload(form);
        if (
          res &&
          res.data?.errorMessageList.length === 0 &&
          res.data?.successFlag === 1 &&
          res.success &&
          res.code === 200
        ) {
          uploadErrorDialog.importErrorVisible = false;
          buttonType.uploadLoading = false;
          onSearch();
          messageInstance.close();
          clearFile.value.value = null;
          return proxy.$message.success('导入成功');
        }
        if (res && res.data === null && res.success === false && res.code === 500) {
          uploadErrorDialog.importErrorVisible = false;
          buttonType.uploadLoading = false;
          messageInstance.close();
          clearFile.value.value = null;
          return proxy.$message.error('导入失败, ' + res.message);
        }
        if (
          res &&
          res.data?.errorMessageList.length > 0 &&
          res.data?.successFlag === 0 &&
          res.success &&
          res.code === 200
        ) {
          uploadErrorDialog.errorDataList = res.data.errorMessageList || [];
          uploadErrorDialog.importErrorVisible = true;
          buttonType.uploadLoading = false;
        } else {
          uploadErrorDialog.importErrorVisible = false;
          buttonType.uploadLoading = false;
          proxy.$message.error('导入失败');
        }
        messageInstance.close();
        clearFile.value.value = null;
      } catch (error) {
        uploadErrorDialog.errorDataList = [];
        uploadErrorDialog.importErrorVisible = false;
        buttonType.uploadLoading = false;
        messageInstance.close();
        clearFile.value.value = null;
      }
    };

    // 下载模板按钮事件
    const onDownload = async () => {
      if (buttonType.downLoadLoading) {
        return;
      }
      buttonType.downLoadLoading = true;
      await noParamsDownload(
        buttonType.downLoadUrl,
        '下载',
        () => {
          buttonType.downLoadLoading = false;
        },
        () => {
          buttonType.downLoadLoading = false;
        }
      );
    };

    // 错误弹框关闭事件
    const errorDialogClose = () => {
      uploadErrorDialog.importErrorVisible = false;
    };

    // 通过code查name
    const queryNameByCode = (code: string, list: MeasureLibrary.type[]) => {
      let name: string = '';
      list.map((item: MeasureLibrary.type) => {
        if (item.code === code) {
          name = item.name;
        }
      });
      return name;
    };

    onMounted(async () => {
      await querySystem();
      await queryMeasureStatus();
      await queryExecutionCycle();
      await onSearch();
    });

    return {
      formInline,
      pageSizesArray,
      clearFile,
      ...toRefs(tableContentType),
      ...toRefs(dialogType),
      ...toRefs(buttonType),
      ...toRefs(uploadErrorDialog),
      onSearch,
      onReset,
      onPageSizeChange,
      onCurrentChange,
      onAdd,
      onDetails,
      onBlUpdate,
      onBlDelete,
      getList,
      onExport,
      onUpload,
      getFile,
      onDownload,
      errorDialogClose,
      queryNameByCode,
    };
  },
});
