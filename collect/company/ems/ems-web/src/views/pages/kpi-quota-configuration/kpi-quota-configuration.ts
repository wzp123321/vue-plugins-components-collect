import { defineComponent, reactive, ref, computed, onMounted, watch, onUnmounted } from 'vue';
// components
import { ElPopconfirm } from 'element-plus';
import { useStore } from 'vuex';

import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import { thousandSeparation } from '@/utils/index';
import { cloneDeep } from 'lodash';

import { pageSizes } from '@/config/config';
import { CHOOSETIME } from '@/config/enum';
import url from '@/api/api-url';

import CommonService from '@/services/common/common.service';
import KPIQuota from './services/kpi-quota-configuration';

import DialogAddAndEdit from './components/kqc-add-edit-dialog.vue';
export interface TreeData {
  [key: string]: any;
}
export default defineComponent({
  components: {
    DialogAddAndEdit,
    ElPopconfirm,
  },
  setup() {
    const store = useStore();
    const nums = ref(1);
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();
    const radioData = proxy.$emsConfig.treeTypeList;
    const lightOrDark = computed(() => {
      // 通过获取仓库的白天黑夜来兼容黑夜样式
      return store.getters.theme === 'light' ? true : false;
    });
    const rows: any = ref(''); // 接收编辑时传的数据对象
    const clearFile = ref(); // 获取input框ref
    const formInline = reactive<TreeData>({
      KPIType: '',
      energyType: '',
      chooseTime: '',
      date: '',
      radioValue: 1,
      analysisObject: [],
      pageSize: pageSizes[0],
      pageNum: 1,
      monthDate1: '',
      monthDate2: '',
      pageSizes,
    });
    const uploadLoading = ref<boolean>(false);
    let formInline_copy: KPIQuota.CommonObject;
    const dialogFormVisibleAdd = ref<boolean>(false);
    const analysisObjectExpanedKeys = ref<number[]>([]);
    const KPITypeData = ref<KPIQuota.CommonObject[]>([]);
    const KPITypeData_copy = ref<KPIQuota.CommonObject[]>([]); // 传给子组件数据
    const analysisObjectData = ref<KPIQuota.CommonObject[]>([]); // 能源分析数据
    const treeLoading = ref<boolean>(false);

    const chooseTimeData = ref<KPIQuota.CommonObject[]>([
      { quotaType: '', quotaTypeName: '全部' },
      { quotaType: '1', quotaTypeName: '月' },
      { quotaType: '2', quotaTypeName: '年' },
    ]); // 定额类型数据
    let fileName: any; // 文件名称
    const abnormal = ref<boolean>(true);
    const tableData = ref<KPIQuota.CommonObject[]>([]); // 列表数据
    const total = ref(0); // 总数
    const tableDataLoading = ref<boolean>(true);
    // 监听定额类型 来给予年和月2种不同格式的传参
    watch(
      () => formInline.chooseTime,
      (newVal: string | number) => {
        if (newVal === CHOOSETIME.MONTH) {
          const date = new Date();
          let mm: number | string = date.getMonth() + 1;
          if (date.getMonth() + 1 < 10) mm = '0' + mm;
          formInline.monthDate1 = date.getFullYear() + '-' + mm;
          formInline.monthDate2 = date.getFullYear() + '-' + mm;
        }
        if (newVal === CHOOSETIME.YEAR) {
          const date = new Date();
          formInline.monthDate1 = String(date.getFullYear());
          formInline.monthDate2 = String(date.getFullYear());
        }
      },
    );
    // 定额数据实时根据KPI类型改变而改变
    watch(
      () => formInline.KPIType,
      () => {
        KPITypeData.value.forEach((item: KPIQuota.CommonObject) => {
          if (item.kpiTypeId === formInline.KPIType) {
            if (item.kpiTypeId === '') {
              chooseTimeData.value = [
                { quotaType: '', quotaTypeName: '全部' },
                { quotaType: '1', quotaTypeName: '月' },
                { quotaType: '2', quotaTypeName: '年' },
              ];
            } else {
              let flag = 0;
              item.quotaTypeList.forEach((item: any) => {
                if (item.quotaType === '') {
                  flag = 1;
                }
              });
              if (flag === 0) {
                item.quotaTypeList.unshift({
                  quotaType: '',
                  quotaTypeName: '全部',
                });
              }
              chooseTimeData.value = item.quotaTypeList;
            }
          }
        });
        formInline.chooseTime = chooseTimeData.value[0].quotaType;
      },
      // {
      //   immediate: true,
      // }
    );
    // 获取KPI类型
    const getKPITypeData = async () => {
      const res = await KPIQuota.queryKpiTypeAndQuotaType();
      if (res.code === 200 && res.success) {
        KPITypeData.value = res.data || [];
        KPITypeData_copy.value = cloneDeep(KPITypeData.value);
        KPITypeData.value.unshift({ kpiTypeId: '', kpiTypeName: '全部' });
        formInline.KPIType = KPITypeData.value[0].kpiTypeId;
      } else {
        return proxy.$message.error(res.message);
      }
    };
    // 选择树radio切换触发的事件
    const treeRaidoChange = () => {
      getAnalysisTreeData({
        treeType: formInline.radioValue,
      });
    };
    // 获取分析对象数据
    const getAnalysisTreeData = async (param: any) => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(param.treeType, '00000', 2, true);
        if (res && res?.data) {
          analysisObjectData.value = res.data ?? [];
          analysisObjectExpanedKeys.value = res.expandTreeIds ?? [];
          formInline.analysisObject = res.data && res.data.length > 0 ? [res.data[0].id] : [];
        } else {
          analysisObjectData.value = [];
          analysisObjectExpanedKeys.value = [];
          tableDataLoading.value = false;
          formInline.analysisObject = [];
        }
      } catch {
        analysisObjectData.value = [];
        tableDataLoading.value = false;
        analysisObjectExpanedKeys.value = [];
        formInline.analysisObject = [];
        abnormal.value = false;
      } finally {
        treeLoading.value = false;
      }
    };
    const onSubmit = () => {
      formInline.pageNum = 1;
      formInline.pageSize = pageSizes[0];
      getList();
    };
    // 查询列表
    const getList = async () => {
      tableDataLoading.value = true;
      try {
        const obj = {
          kpiTypeId: formInline.KPIType ? formInline.KPIType : null,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: formInline.pageNum,
          pageSize: formInline.pageSize,
          quotaEndTime: formInline.chooseTime !== 0 ? (formInline.monthDate2 ? formInline.monthDate2 : null) : null,
          quotaStartTime: formInline.chooseTime !== 0 ? (formInline.monthDate1 ? formInline.monthDate1 : null) : null,
          quotaType: formInline.chooseTime ? formInline.chooseTime : null,
          searchCount: true,
          treeId: formInline.analysisObject[0] ? formInline.analysisObject[0] : null,
        };
        const res = await KPIQuota.getListUrl(obj);
        if (res.code === 200 && res.success) {
          tableData.value = res.data.list || [];
          total.value = res.data.total;
          abnormal.value = true;
        } else {
          abnormal.value = false;
          proxy.$message.error(res.message);
        }
        tableDataLoading.value = false;
      } catch {
        abnormal.value = false;
        tableDataLoading.value = false;
      }
    };
    const onReset = () => {
      Object.assign(formInline, formInline_copy);
      onSubmit();
    };
    // 新增弹框显示
    const increaseData = () => {
      rows.value = null;
      dialogFormVisibleAdd.value = true;
      nums.value++;
    };
    // 格式化列表日期 年、月2种类型 后台返回格式 yy-mm-dd y:m:s
    const formatDate = (row: any) => {
      let arr = [];
      arr = row.quotaTime.split(' ');
      let c;
      if (row.quotaTime && String(row.quotaType) == '1') {
        const index = arr[0].lastIndexOf('-');
        c = arr[0].slice(0, index);
      } else if (row.quotaTime && String(row.quotaType) == '2') {
        const index = arr[0].indexOf('-');
        c = arr[0].slice(0, index);
      }
      return c;
    };
    // 这个期望返回的是空 不是 --
    const formatValues = (row: any) => {
      if (row.consumeValue || row.consumeValue === 0) {
        return row.consumeValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return;
      }
    };
    // 打开文件资源 选择文件
    const getFile = async (event: any) => {
      fileName = event.target.files[0];
      if (fileName !== undefined) {
        const file_typename = fileName.name.substring(fileName.name.lastIndexOf('.'));
        if (file_typename === '.xlsm') {
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
    const importData = async (params: KPIQuota.paramsType) => {
      uploadLoading.value = true;
      const form: any = new FormData(); // FormData 对象
      form.append('file', params); // 文件对象
      try {
        const res = await KPIQuota.getDeviceList(form);
        if (
          (res && res.data && res.data.code === 200 && res.data.success) ||
          (res && res.code === 200 && res.success)
        ) {
          uploadLoading.value = false;
          getList();
          proxy.$message.success(res.message);
        } else {
          uploadLoading.value = false;
          if (!(String(res?.code).includes('4f') || String(res?.code) === '401')) {
            proxy.$message.error(res?.message);
          }
        }
        clearFile.value.value = null;
      } catch (err) {
        clearFile.value.value = null;
        uploadLoading.value = false;
        proxy.$message.error('上传失败');
      }
    };
    // 下载
    const downLoad = async () => {
      const treeTypesArr = radioData.map((item: { value: number }) => {
        return item.value;
      });
      const treeTypes = treeTypesArr.join();
      await CommonService.getFileStreamDownload({ treeTypes }, url.downLoad.exportDownloadKpiQuotaTemplate, '下载');
    };
    /*
      年、月不可选时间限制 start
      */
    const startMonth = (time: Date) => {
      return formInline.monthDate2 && time.getTime() > new Date(formInline.monthDate2 + '-' + '01').getTime();
    };
    const endMonth = (time: Date) => {
      return formInline.monthDate1 && time.getTime() <= new Date(formInline.monthDate1 + '-' + '01').getTime();
    };
    const startYear = (time: any) => {
      return formInline.monthDate2 && time.getFullYear() > formInline.monthDate2;
    };
    const endYear = (time: any) => {
      return formInline.monthDate1 && time.getFullYear() < formInline.monthDate1;
    };
    /* 年、月不可时间限制 end*/
    // 点击修改
    const updateFn = (row: any) => {
      // console.log(row);
      rows.value = row;
      dialogFormVisibleAdd.value = true;
      nums.value++;
    };

    // 确认删除
    const sureDelete = async (params: number) => {
      try {
        const res = await KPIQuota.delete(params);
        if (res && res.code === 200 && res.success) {
          getList();
          return proxy.$message.success(res.message);
        } else {
          return proxy.$message.error(res.message);
        }
      } catch (error) {
        proxy.$message.error('删除失败');
      }
    };

    // 每页条数改变
    const onPageSizeChange = (value: number) => {
      formInline.pageSize = value;
      getList();
    };
    // 每页改变
    const onCurrentChange = (value: number) => {
      formInline.pageNum = Math.floor(value);
      getList();
    };
    let queryName;
    const kpiTypeId = ref();
    const kpiDingeType = ref();
    // 初始化
    onMounted(async () => {
      try {
        tableDataLoading.value = true;
        await getKPITypeData();
        await getAnalysisTreeData({
          treeType: formInline.radioValue,
        });
        if (KPITypeData.value?.length === 0 || analysisObjectData.value?.length === 0) {
          tableDataLoading.value = false;
          return;
        }
        await onSubmit();
        queryName = sessionStorage.getItem('ems-kpiName');
        kpiTypeId.value = Number(sessionStorage.getItem('ems-kpiTypeId'));
        kpiDingeType.value = Number(sessionStorage.getItem('ems-kpiDingeType'));
        console.log(queryName);
        if (queryName) {
          increaseData();
          window.sessionStorage.removeItem('ems-kpiName');
        }
        formInline_copy = cloneDeep(formInline);
      } catch (error) {
        tableDataLoading.value = false;
      }
    });
    onUnmounted(() => {
      sessionStorage.removeItem('ems-kpiName');
      sessionStorage.removeItem('ems-kpiTypeId');
      sessionStorage.removeItem('ems-kpiDingeType');
    });
    return {
      formInline,
      KPITypeData,
      analysisObjectData,
      treeLoading,
      radioData,
      analysisObjectExpanedKeys,
      chooseTimeData,
      CHOOSETIME,

      getAnalysisTreeData,
      treeRaidoChange,
      onSubmit,
      onReset,
      startMonth,
      endMonth,
      startYear,
      endYear,
      getFile,
      importDatas,
      downLoad,
      increaseData,
      abnormal,
      tableData,
      total,
      tableDataLoading,
      onPageSizeChange,
      onCurrentChange,
      sureDelete,
      updateFn,
      lightOrDark,
      formatDate,
      thousandSeparation,
      nums,
      getKPITypeData,
      KPITypeData_copy,
      getList,
      rows,
      dialogFormVisibleAdd,
      formatValues,
      clearFile,
      uploadLoading,
      kpiTypeId,
      kpiDingeType,
    };
  },
});
