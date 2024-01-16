import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { ElForm, ElInput } from 'element-plus';
import { pageSizes } from '@/config/index';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingSystem from '@/pages/benchmarking-system/service/benchmarking-system.service';
import benchmarkingDataMaintenance from '@/pages/benchmarking-data-maintenance/service/benchmarking-data-maintenance.service';
import { formatDate } from '@/utils/index';
import message from '@/utils/message';
import DownloadDialog from './components/bdm-download-dialog/bdm-download-dialog.vue';
import UpdateDialog from './components/bdm-update-dialog/bdm-update-dialog.vue';
import CommonService from '@/services/common/common';

interface formInlineType {
  systemId: number | undefined;
  valueTime: Date | undefined | string;
  benchmarkingType: string;
}

interface systemType {
  general: string;
  systemTypeText: string;
  systemName: string;
  heatingModeText: string;
  regionType: string;
  systemLevel: string;
  systemType: string;
  heatingMode: string;
  id: number;
  coolingMode: string;
  systemLevelText: string;
  regionTypeText: string;
  coolingModeText: string;
}
interface benchmarkingDataValueQueryVOListType {
  benchmarkingIndexId: number | undefined;
  benchmarkingType: string;
  id: number | undefined;
  systemId: number | undefined;
  treeId: number | undefined;
  value: string | null;
  valueTime: string;
}
interface tableDataType {
  treeId: number | undefined;
  systemId: number | undefined;
  treeLevel: number | undefined;
  name: string;
  benchmarkingDataValueQueryVOList: benchmarkingDataValueQueryVOListType[];
}

interface paramsType {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

export default defineComponent({
  name: 'benchmarkingDataMaintenance',
  components: { DownloadDialog, UpdateDialog },
  setup() {
    const { proxy } = useCurrentInstance();
    const multipleTable = ref(ElForm);
    const inputDataRef = ref(ElInput); // 获取编辑input框ref
    const clearFile = ref(); //获取导入input框ref
    let loading = ref<boolean>(true);
    let downLoading = ref<boolean>(false);
    let nums = ref<number>(1);
    let pageNum = ref<number>(1);
    let pageSize = ref<number>(pageSizes[0]);
    let total = ref<number>(10);
    let dialogAdd = ref<boolean>(false);
    let dialogUpdate = ref<boolean>(false);
    let systemList = ref<systemType[]>([]); // 体系
    let fileName: any; //文件名称
    // 下载loading
    const downloadLoading = ref(false);
    //更新数据lodaing
    const updateLoading = ref(false);
    const quotaTypeList = [
      {
        label: '月',
        value: '1',
      },
      {
        label: '年',
        value: '2',
      },
    ];
    let formInline = reactive<formInlineType>({
      systemId: 0 || undefined,
      valueTime: '',
      benchmarkingType: quotaTypeList[0].value || '1',
    });
    let form = reactive<benchmarkingDataValueQueryVOListType>({
      benchmarkingIndexId: 0,
      benchmarkingType: '',
      id: 0,
      systemId: 0,
      treeId: 0,
      value: '',
      valueTime: '',
    });
    const tableData = ref<tableDataType[]>([]); // 表格绑定数据
    let editErrorMessage = '';

    let serverDate: Date;
    const tableHeadData = ref<tableDataType>({
      treeId: 0,
      systemId: 0,
      treeLevel: 0,
      name: '',
      benchmarkingDataValueQueryVOList: [],
    }); // thead数据
    // 初始化日期
    const pageInit = async () => {
      try {
        serverDate = await CommonService.getServerDate();
        formInline.valueTime = new Date(serverDate.setMonth(new Date().getMonth() - 1));
      } catch (err) {
        tableData.value = [];
      }
    };

    // 搜索
    const onSearch = () => {
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      editFlag = 1;
      if (systemList.value?.length === 0) {
        return;
      }
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.systemId = systemList.value[0].id || undefined;
      formInline.valueTime = new Date(new Date().setMonth(new Date().getMonth() - 1));
      formInline.benchmarkingType = quotaTypeList[0].value || '1';
      editFlag = 1;
      onSearch();
    };
    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        let conversionDate = calculateDateByType();
        let obj = {
          systemId: formInline.systemId,
          valueTime: conversionDate,
          benchmarkingType: formInline.benchmarkingType,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
        };
        const res = await benchmarkingDataMaintenance.getListUrl(obj);
        if (res.code == 200 && res.success) {
          tableData.value = res.data.benchmarkingDataQueryVOList || [];
          tableHeadData.value = res.data.benchmarkingDataQueryVO || {};
          // 给单元格数据追加isInputShow属性，控制input显示隐藏
          tableData.value.forEach((item) => {
            item.benchmarkingDataValueQueryVOList.forEach((val) => (val['isInputShow'] = true));
          });
          total.value = res.data.total;
          loading.value = false;
        } else {
          loading.value = false;
          tableData.value = [];
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error) {
        loading.value = false;
        tableData.value = [];
        proxy.$message.error('获取列表数据失败');
      } finally {
        loading.value = false;
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

    // 查询体系
    const querysystemList = async () => {
      try {
        const res = await benchMarkingSystem.queryListUrl();
        if (res.code == 200 && res.success) {
          systemList.value = res.data || [];
          formInline.systemId = res.data[0].id;
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取体系失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取体系失败');
      }
    };
    /**
     * 处理时间
     * benchmarkingType为1时，时间传yyyy-MM；为2时，传yyyy
     */
    const calculateDateByType = () => {
      const { benchmarkingType, valueTime } = formInline;
      return formatDate(valueTime, benchmarkingType === '1' ? 'yyyy-MM' : 'yyyy');
    };

    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      try {
        return date.getTime() > new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();
      } catch (error) {
        console.log('error----', error);
      }
    };
    const onDisableDateCbYear = (date: Date) => {
      try {
        return date.getTime() > new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getTime();
      } catch (error) {
        console.log('error----', error);
      }
    };
    let editFlag = 1; //判断是否有单元格在编辑状态
    let timer: any; // 定时器
    let loadingTimer: any; // 下载定时器

    // 编辑图标点击事件
    const onChekImg = (val: any, index: number) => {
      clearTimeout(timer);
      if (editFlag == 0) {
        if (editErrorMessage === '') {
          message.error('请将先前的单元格编辑完成');
        }
        return;
      }
      editFlag = 0;
      val.benchmarkingDataValueQueryVOList[index].isInputShow = false;
      let input_dom = <HTMLImageElement>document.querySelector(`.input_${index} .el-input__inner`);

      timer = setTimeout(() => {
        input_dom.focus();
      }, 500);
      let conversionVlueTime = calculateDateByType();
      // 传参
      form.benchmarkingIndexId = val.benchmarkingDataValueQueryVOList[index].benchmarkingIndexId;
      form.benchmarkingType = formInline.benchmarkingType;
      form.id = val.benchmarkingDataValueQueryVOList[index].id ? val.benchmarkingDataValueQueryVOList[index].id : null;
      form.systemId = val.systemId;
      form.treeId = val.treeId;
      form.value = val.benchmarkingDataValueQueryVOList[index].valueBigdecimal;
      form.valueTime = conversionVlueTime;
    };

    // input框失去焦点事件
    const onInputBurl = (e: InputEvent, val: any, index: number) => {
      // 不为空时的校验无效0
      if (form.value !== '' && form.value !== null && Number(form.value) === 0) {
        message.error('请输入一个大于0的数字');
        editErrorMessage = '请输入一个大于0的数字';
        if (e.target) {
          (e.target as HTMLInputElement)?.focus();
        }
        return;
      }
      editErrorMessage = '';
      editFlag = 1;
      if (form.value !== null && form.value !== val.benchmarkingDataValueQueryVOList[index].valueBigdecimal) {
        let obj = {
          benchmarkingIndexId: form.benchmarkingIndexId,
          benchmarkingType: formInline.benchmarkingType,
          id: form.id,
          systemId: form.systemId,
          treeId: form.treeId,
          value: form.value === '' ? null : form.value,
          valueTime: form.valueTime,
        };
        updated(obj);
      }
      val.benchmarkingDataValueQueryVOList[index].isInputShow = true;
    };

    // 对标数据维护保存
    const updated = async (form: benchmarkingDataValueQueryVOListType) => {
      try {
        loading.value = true;
        const res = await benchmarkingDataMaintenance.updateUrl(form);
        if (res.code == 200 && res.success) {
          loading.value = false;
          proxy.$message.success(res?.message);
          getList();
        } else {
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '操作失败');
          }
        }
      } catch (error) {
        loading.value = false;
        proxy.$message.error('操作失败');
      }
    };

    // 导入
    // 打开文件资源 选择文件
    const getFile = async (event: any) => {
      fileName = event.target.files[0];
      if (fileName != undefined) {
        let file_typename = fileName.name.substring(fileName.name.lastIndexOf('.'));
        if (file_typename === '.xlsx') {
          importData(fileName);
        } else {
          alert('请选择正确的文件类型！');
        }
      }
    };

    // 点击导入事件 自动触发点击input框
    const importDatas = () => {
      clearFile.value.dispatchEvent(new MouseEvent('click'));
    };
    const importData = async (params: paramsType) => {
      loading.value = true;
      let form: any = new FormData(); // FormData 对象
      form.append('file', params); // 文件对象
      // console.log(form, 'form');

      const res = await benchmarkingDataMaintenance.uploadBenchmarkingData(form);
      if ((res && res.data && res.data.code === 200 && res.data.success) || (res && res.code === 200 && res.success)) {
        onSearch();
        proxy.$message.success(res.message);
        loading.value = false;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          proxy.$message.error(res.message);
        }
        loading.value = false;
      }
      loading.value = false;
      clearFile.value.value = null;
    };

    // 下载
    const downLoad = () => {
      if (downloadLoading.value) {
        return;
      }
      dialogAdd.value = true;
    };
    const onDownloaddOK = () => {
      dialogAdd.value = false;
      downloadLoading.value = false;
    };
    // 更新数据
    const updateData = () => {
      if (updateLoading.value) {
        return;
      }
      dialogUpdate.value = true;
    };
    const onUpdateOk = () => {
      dialogUpdate.value = false;
      updateLoading.value = false;
    };
    onMounted(async () => {
      await querysystemList();
      if (systemList.value?.length === 0) {
        return;
      }
      await pageInit();
      await onSearch();
    });
    watch(
      () => formInline.benchmarkingType,
      (newValue) => {
        formInline.valueTime =
          newValue == '1'
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      },
    );

    return {
      onSearch,
      onReset,
      formInline,
      tableData,
      tableHeadData,
      loading,
      pageNum,
      pageSize,
      total,
      pageSizes,
      multipleTable,
      nums,
      dialogAdd,
      dialogUpdate,
      systemList,
      quotaTypeList,
      form,
      inputDataRef,
      clearFile,
      downLoading,
      downloadLoading,
      updateLoading,
      getList,
      onPageSizeChange,
      onCurrentChange,
      onDisableDateCb,
      onDisableDateCbYear,
      onChekImg,
      onInputBurl,
      getFile,
      importDatas,
      importData,
      downLoad,
      updateData,
      onDownloaddOK,
      onUpdateOk,
    };
  },
});
