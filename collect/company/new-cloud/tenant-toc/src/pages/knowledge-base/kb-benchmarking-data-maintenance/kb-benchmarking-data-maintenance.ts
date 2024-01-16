import { defineComponent, reactive, computed, ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElInput, ElDialog } from 'element-plus';

// utils
import { FGetQueryParam, formatDateStamp } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import message from '@/utils/message';

// config
import { pageSizesArray } from '@/config/index';

import BenchMarkingDataMaintenanceService from '@/pages/knowledge-base/kb-benchmarking-data-maintenance/service/kb-benchmarking-data-maintenance.service';
import { quotaTypeList } from '@/pages/knowledge-base/kb-benchmarking-data-maintenance/constant/index';
import DownloadDialog from './kb-bdm-download-dialog/kb-bdm-download-dialog.vue';

interface formInlineType {
  systemId: number | undefined;
  valueTime: [Date, Date];
  benchmarkingType: string;
}

export default defineComponent({
  name: 'KbBenchmarkingDataMaintenance',
  components: { DownloadDialog },
  setup() {
    const { proxy } = useCurrentInstance();
    const inputDataRef = ref(ElInput); // 获取编辑input框ref
    const downloadRef = ref(ElDialog); // 下载弹框ref
    const systemList = ref<BenchmarkingDataMaintenance.SystemListUrlParams[]>([]); // 体系
    const loading = ref<boolean>(true);
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizesArray[0]);
    const total = ref<number>(10);
    const tableData = ref<BenchmarkingDataMaintenance.BenchmarkingDataQueryVOType[]>([]); // tbody数据
    // thead数据
    const tableHeadData = ref<BenchmarkingDataMaintenance.BenchmarkingDataQueryVOType>({
      systemId: 0,
      systemName: '',
      valueDate: '',
      benchmarkingDataValueQueryVOList: [],
    });
    // 搜索表单
    const formInline = reactive<formInlineType>({
      systemId: undefined,
      valueTime: [
        new Date(new Date().getFullYear() - 5, new Date().getMonth(), 1, 0, 0, 0),
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 0, 0, 0),
      ],
      benchmarkingType: quotaTypeList[1].value || '2',
    });
    const updateParams = reactive<BenchmarkingDataMaintenance.CreateBenchmarkingDataParams>({
      benchmarkingIndexId: 0,
      benchmarkingType: '',
      id: 0,
      systemId: 0,
      value: '',
      valueTime: '',
    });
    const clearFile = ref(); //获取导入input框ref
    const num = ref<number>(0); // 下载弹框显示隐藏
    let fileName: BenchmarkingDataMaintenance.FileType; // 文件名称
    const importErrorVisible = ref<boolean>(false); // 导入错误弹框显示隐藏
    const uploadLoading = ref(false); // 上传loading
    const errorDataList = ref<BenchmarkingDataMaintenance.errorDataListType[]>([]);

    // 设备id
    const systemId = computed(() => {
      return FGetQueryParam('systemId');
    });
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = value;
      getList();
    };
    // 搜索
    const onSearch = () => {
      pageNum.value = 1;
      pageSize.value = pageSizesArray[0];
      if (systemList.value?.length === 0) {
        return;
      }
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.systemId = Number(systemId.value) || undefined;
      formInline.valueTime = [
        new Date(new Date().getFullYear() - 5, new Date().getMonth(), 1, 0, 0, 0),
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 0, 0, 0),
      ];
      formInline.benchmarkingType = quotaTypeList[1].value || '2';
      onSearch();
    };
    // 查询体系
    const querysystemList = async () => {
      try {
        const res = await BenchMarkingDataMaintenanceService.queryBenchmarkingSyetemSelect();
        if (res.code == 200 && res.success) {
          systemList.value = res.data || [];
          formInline.systemId = res.data.length > 0 ? Number(systemId.value) : undefined;
        } else {
          // proxy.$message.error(res.message || '获取体系失败');
        }
      } catch (error) {
        // proxy.$message.error('获取体系失败');
      }
    };
    // 获取表格数据
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          benchmarkingType: formInline.benchmarkingType,
          endDate:
            formInline.benchmarkingType === '2'
              ? formatDateStamp(formInline.valueTime[1].getTime(), 'YYYY-MM')
              : formatDateStamp(formInline.valueTime[1].getTime(), 'YYYY'),
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
          startDate:
            formInline.benchmarkingType === '2'
              ? formatDateStamp(formInline.valueTime[0].getTime(), 'YYYY-MM')
              : formatDateStamp(formInline.valueTime[0].getTime(), 'YYYY'),
          systemId: Number(formInline.systemId),
        };
        const res = await BenchMarkingDataMaintenanceService.queryBenchmarkingDataMaintenanceList(obj);
        if (res.code == 200 && res.success) {
          tableData.value = res.data.benchmarkingDataQueryVOList || [];
          tableHeadData.value = res.data.benchmarkingDataQueryVO || {};
          // 给单元格数据追加isInputHidden属性，控制input显示隐藏
          tableData.value.forEach((item) => {
            item.benchmarkingDataValueQueryVOList.forEach((val) => (val['isInputHidden'] = true));
          });
          total.value = res.data.total;
          loading.value = false;
        } else {
          loading.value = false;
          tableData.value = [];
          return proxy.$message.error(res.message);
        }
      } catch (error) {
        loading.value = false;
        tableData.value = [];
        proxy.$message.error('获取列表数据失败');
      } finally {
        loading.value = false;
      }
    };
    // 数据时间change事件
    const benchmarkingTypeChange = (val: string) => {
      if (val === '1') {
        // 年
        formInline.valueTime = [new Date(new Date().getFullYear() - 10, 0), new Date(new Date().getFullYear() - 1, 0)];
      } else {
        // 月
        formInline.valueTime = [
          new Date(new Date().getFullYear() - 5, new Date().getMonth(), 1, 0, 0, 0),
          new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 0, 0, 0),
        ];
      }
    };

    // 编辑按钮事件
    const onChekImg = (event: InputEvent, val: BenchmarkingDataMaintenance.BenchmarkingDataValueQueryVOListType) => {
      val.isInputHidden = false;
      nextTick(() => {
        (event.target as HTMLElement)?.parentNode?.parentNode?.parentNode?.querySelector('input')?.focus();
      });
      updateParams.value = val.value;
    };
    // input框失去焦点事件
    const onInputBurl = (
      val: BenchmarkingDataMaintenance.BenchmarkingDataValueQueryVOListType,
      systemId: number,
      time: string,
    ) => {
      if (!(updateParams.value === val.value || (!val.value && !updateParams.value))) {
        const obj = {
          benchmarkingIndexId: val.benchmarkingIndexId,
          benchmarkingType: formInline.benchmarkingType,
          id: val.id ? val.id : null,
          systemId: systemId,
          value: updateParams.value === '' ? null : updateParams.value,
          valueTime: time,
        };
        updated(obj);
      }
      val.isInputHidden = true;
    };
    // 编辑方法
    const updated = async (params: BenchmarkingDataMaintenance.CreateBenchmarkingDataParams) => {
      try {
        loading.value = true;
        const res = await BenchMarkingDataMaintenanceService.updateBenchmarkingData(params);
        if (res.code == 200 && res.success) {
          loading.value = false;
          proxy.$message.success(res.message || '对标数据维护保存成功');
          getList();
        } else {
          loading.value = false;
          proxy.$message.error(res.message || '对标数据维护保存失败');
        }
      } catch (error) {
        loading.value = false;
        proxy.$message.error('对标数据维护保存失败');
      }
    };

    // 导入
    // 点击导入事件 自动触发点击input框
    const importDatas = () => {
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
    const importData = async (params: BenchmarkingDataMaintenance.FileType) => {
      if (uploadLoading.value) {
        return;
      }
      uploadLoading.value = true;
      const messageInstance = message.loading('正在导入');
      try {
        const form: any = new FormData(); // FormData 对象
        form.append('file', params); // 文件对象
        const res = await BenchMarkingDataMaintenanceService.uploadBenchmarkingData(form);
        if (res && res.data === null && res.success && res.code === 200) {
          importErrorVisible.value = false;
          uploadLoading.value = false;
          onSearch();
          proxy.$message.success(res.message);
        } else if (res && res.data === null && !res.success && res.code === 500) {
          importErrorVisible.value = false;
          uploadLoading.value = false;
          proxy.$message.error('导入失败, ' + res.message);
        } else if (res && res.data.length > 0 && res.success && res.code === 200) {
          errorDataList.value = res.data || [];
          importErrorVisible.value = true;
          uploadLoading.value = false;
        } else {
          importErrorVisible.value = false;
          uploadLoading.value = false;
          proxy.$message.error('导入失败, ' + res.message);
        }
        messageInstance.close();
        clearFile.value.value = null;
      } catch (error) {
        uploadLoading.value = false;
        importErrorVisible.value = false;
        proxy.$message.error('导入失败, 请求超时');
        messageInstance.close();
        clearFile.value.value = null;
      }
    };

    // 导入模板错误弹框关闭事件
    const errorDialogClose = () => {
      importErrorVisible.value = false;
    };

    // 下载
    const downLoad = async () => {
      num.value++;
    };

    /* 处理日期禁用回调
    年、月不可选时间限制 start
    */
    const startYear = (time: any) => {
      return (
        time.getTime() > new Date().setFullYear(new Date().getFullYear()) ||
        time.getFullYear() > formatDateStamp(formInline.valueTime[1].getTime(), 'YYYY')
      );
    };
    const endYear = (time: any) => {
      const date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      return (
        time.getFullYear() < formatDateStamp(formInline.valueTime[0].getTime(), 'YYYY') ||
        time.getFullYear() > date.getFullYear()
      );
    };

    const month = (time: Date) => {
      return time.getTime() > new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();
    };
    /* 处理日期禁用回调
    年、月不可选时间限制 end
    */

    onMounted(async () => {
      await querysystemList();
      if (systemList.value?.length === 0) {
        return;
      }
      await onSearch();
    });
    return {
      systemId,
      systemList,
      formInline,
      quotaTypeList,
      loading,
      tableData,
      tableHeadData,
      total,
      pageNum,
      pageSize,
      pageSizesArray,
      updateParams,
      inputDataRef,
      clearFile,
      downloadRef,
      num,
      importErrorVisible,
      uploadLoading,
      errorDataList,
      onSearch,
      onReset,
      benchmarkingTypeChange,
      onPageSizeChange,
      onCurrentChange,
      onInputBurl,
      getFile,
      importDatas,
      downLoad,
      onChekImg,
      startYear,
      endYear,
      month,
      errorDialogClose,
    };
  },
});
