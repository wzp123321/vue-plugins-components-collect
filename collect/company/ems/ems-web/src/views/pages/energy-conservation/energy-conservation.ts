import { defineComponent, onMounted, reactive, ref, watch, computed, onUnmounted } from 'vue';

import dialogAdd from './components/ec-add-dialog/ec-add-dialog.vue';
import dialogEdit from './components/ec-edit-dialog/ec-edit-dialog.vue';
import CommonService from '@/services/common/common.service';
// services
import EnergyConservationServation from '@/services/energy-conservation/energy-conservation.service';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { thousandSeparation } from '@/utils/index';
import { cloneDeep } from 'lodash';
import { useStore } from 'vuex';
import { useCommonController } from '@/utils/use-common-controller';
// config
import { pageSizes } from '@/config/config';
import { CHOOSETIME } from '@/config/enum';
import url from '@/api/api-url';
export interface TreeData {
  [key: string]: any;
}
export interface formInlineType {
  energyType: string;
  chooseTime: string | number;
  date: any;
  radioValue: number;
  analysisObject: any[];
  pageSize: number;
  pageNum: number;
  monthDate1: string;
  monthDate2: string;
  pageSizes: number[];
}
export interface getAnalysisTreeDataType {
  energyCode: string;
  treeType: number;
  expandLevel: number;
}
export interface rowType {
  energyCode: string;
  energyCodeName: string;
  highAlarm: number | null;
  highWarning: number | null;
  id: number | string;
  inputSource: any;
  inputSourceName: string;
  lowAlarm: number | null;
  lowWarning: number | null;
  quotaTime: string;
  quotaType: any;
  quotaTypeName: string;
  quotaValue: number | string;
  treeId: number | null;
  treeName: string;
  quotaTimeCopy?: string;
}
export interface paramsType {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
export default defineComponent({
  components: {
    dialogAdd,
    dialogEdit,
  },
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    const lightOrDark = computed(() => {
      // 通过获取仓库的白天黑夜来兼容黑夜样式
      return store.getters.theme === 'light' ? true : false;
    });
    // 公共方法
    const { queryEnergyFlagOneExcludeTotalTree, getDictDataByCode, getTreeListWithExpandKeys } = useCommonController();
    const addChilde = ref(); // 获取新增弹框ref
    const clearFile = ref(); // 获取input框ref

    const analysisObjectExpanedKeys = ref<number[]>([]);
    const treeLoading = ref<boolean>(false);

    const uploadLoading = ref<boolean>(false);
    const dialogFormVisibleAdd = ref<boolean>(false);
    const dialogFormVisibleEdit = ref<boolean>(false);
    const tableDataLoading = ref<boolean>(true);
    const abnormal = ref<boolean>(true);
    const radioData = proxy.$emsConfig.treeTypeList;
    // 能源类型数据
    const energyTypeData = ref<EnergyCodeManageModule.EnergyInfo[]>([]);
    /* 头部搜索 表单数据 */
    const formInline = reactive<formInlineType>({
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
    const chooseTimeData = ref<{ code: string; name: string }[]>([]); // 定额类型数据
    const analysisObjectData = ref<TreeData[]>([]); // 能源分析数据
    let formInlineCopy: formInlineType; // 深拷贝 便于重置
    let fileName: any; // 文件名称
    const tableData = ref<GlobalModule.CommonObject[]>([]); // 列表数据
    const total = ref(0); // 总数
    const editData: any = ref();
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
    // 选择树radio切换触发的事件
    const treeRaidoChange = () => {
      if (formInline.energyType?.length === 0 || formInline.energyType !== energyTypeData.value[0].toString()) {
        formInline.energyType = energyTypeData.value?.length ? energyTypeData.value[0].code : '';
      }
      console.log(formInline.energyType, energyTypeData.value, 'formInline.energyType');

      getAnalysisTreeData({
        treeType: formInline.radioValue,
        energyCode: formInline.energyType,
        expandLevel: 2,
      });
    };
    const treeSelectChange = () => {
      // console.log(formInline.analysisObject);
    };
    // 能源类型下拉框选项点击事件
    const energyTypeOPtionClick = (val: any) => {
      getAnalysisTreeData({
        energyCode: val,
        expandLevel: 2,
        treeType: formInline.radioValue,
      });
    };
    // 获取能源类型数据
    const getEnergyCodeData = async () => {
      try {
        energyTypeData.value = await queryEnergyFlagOneExcludeTotalTree();
        const allTypes = {
          childEnergyCode: [],
          code: '',
          name: '全部',
        };
        energyTypeData.value.unshift(allTypes);
        formInline.energyType = energyTypeData.value?.length ? energyTypeData.value[0].code : '';
      } catch (err) {
        abnormal.value = false;
      }
    };

    // 获取分析对象数据
    const getAnalysisTreeData = async (param: getAnalysisTreeDataType) => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(param.treeType, param.energyCode, param.expandLevel, true);
        if (res && res?.data) {
          analysisObjectData.value = res.data ?? [];
          analysisObjectExpanedKeys.value = res.expandTreeIds ?? [];
          formInline.analysisObject = res.data && res.data.length > 0 ? [res.data[0].id] : [];
        } else {
          analysisObjectData.value = [];
          analysisObjectExpanedKeys.value = [];
          formInline.analysisObject = [];
        }
      } catch {
        analysisObjectData.value = [];
        analysisObjectExpanedKeys.value = [];
        formInline.analysisObject = [];
        abnormal.value = false;
      } finally {
        treeLoading.value = false;
      }
    };
    // 查询事件
    const onSubmit = (flag?: string) => {
      if (!formInline.chooseTime) {
        proxy.$message.error('选择时间不能为空');
        tableDataLoading.value = false;
        return;
      }
      // 点击查询按钮必定重置该项 否则可能pagesize和pagenum影响查找结果
      if (flag) {
        formInline.pageNum = 1;
        formInline.pageSize = pageSizes[0];
      }
      const obj = {
        energyCode: formInline.energyType,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: formInline.pageNum,
        pageSize: formInline.pageSize,
        quotaType: formInline.chooseTime ? formInline.chooseTime : 0,
        searchCount: true,
        treeId: formInline.analysisObject[0] ? formInline.analysisObject[0] : '',
        quotaEndTime: formInline.chooseTime !== 0 ? formInline.monthDate2 : '',
        quotaStartTime: formInline.chooseTime !== 0 ? formInline.monthDate1 : '',
      };
      getList(obj);
    };
    /*
      年、月不可时间限制 start
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
    // 格式化列表日期 年、月2种类型 后台返回格式 yy-mm-dd y:m:s
    const formatDate = (row: rowType) => {
      let arr = [];
      arr = row.quotaTime.split(' ');
      let c;
      if (row.quotaTime && row.quotaType === 1) {
        const index = arr[0].lastIndexOf('-');
        c = arr[0].slice(0, index);
      } else if (row.quotaTime && row.quotaType === 2) {
        const index = arr[0].indexOf('-');
        c = arr[0].slice(0, index);
      }
      return c;
    };
    // 格式化列表
    const formatterAlarm = (row: any, column: any, cellValue: any) => {
      return thousandSeparation(cellValue);
    };
    // 查询数据列表
    const getList = async (param: any) => {
      try {
        tableDataLoading.value = true;
        const res = await EnergyConservationServation.getList(param);
        if (res && res.code === 200 && res.success) {
          tableData.value = res.data.list || [];
          total.value = res.data.total;
          tableDataLoading.value = false;
        } else {
          abnormal.value = false;
          tableDataLoading.value = false;
          return proxy.$message.error(res.message);
        }
      } catch (err) {
        abnormal.value = false;
        tableDataLoading.value = false;
      } finally {
        tableDataLoading.value = false;
      }
    };
    // 重置
    const onReset = () => {
      Object.assign(formInline, formInlineCopy);
      onSubmit();
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
    const importData = async (params: paramsType) => {
      uploadLoading.value = true;
      const form: any = new FormData(); // FormData 对象
      form.append('file', params); // 文件对象
      const res = await EnergyConservationServation.getDeviceList(form);
      if ((res && res.data && res.data.code === 200 && res.data.success) || (res && res.code === 200 && res.success)) {
        onSubmit();
        proxy.$message.success(res.message);
      } else {
        if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
          proxy.$message.error(res.message);
        }
      }
      uploadLoading.value = false;
      clearFile.value.value = null;
    };
    // 下载
    const downLoad = async () => {
      const treeTypesArr = radioData.map((item: { value: number }) => {
        return item.value;
      });
      const treeTypes = treeTypesArr.join();
      await CommonService.getFileStreamDownload({ treeTypes }, url.downLoad.energyConservationExport, '下载');
    };
    // 新增弹框显示
    const increaseData = () => {
      dialogFormVisibleAdd.value = true;
    };
    // 新增弹框关闭
    const diaogAddCancel = () => {
      dialogFormVisibleAdd.value = false;
    };
    // 编辑成功
    const dialogEditSureFn = () => {
      dialogFormVisibleEdit.value = false;
      formInline.pageNum = 1;
      onSubmit();
    };
    // 点击修改
    const updateFn = (index: number, rows: any) => {
      editData.value = rows[index];
      dialogFormVisibleEdit.value = true;
    };

    // 确认删除
    const sureDelete = async (params: number) => {
      try {
        const res = await EnergyConservationServation.getTreeUnBind(params);
        if (res && res.code === 200 && res.success) {
          onSubmit();
          return proxy.$message.success(res.message);
        } else {
          if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
            proxy.$message.error(res.message || '删除失败');
          }
        }
      } catch (error) {
        proxy.$message.error('删除失败');
      }
    };

    // 每页条数改变
    const onPageSizeChange = (value: number) => {
      formInline.pageSize = value;
      onSubmit();
    };
    // 每页改变
    const onCurrentChange = (value: number) => {
      formInline.pageNum = Math.floor(value);
      onSubmit();
    };
    const addSuccessFn = () => {
      dialogFormVisibleAdd.value = false;
      onSubmit();
    };
    let queryName;
    const energyConservationEnergyCode = ref();
    const kpiDingeType = ref();
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        // 获取定额类型数据
        tableDataLoading.value = true;
        chooseTimeData.value = await getDictDataByCode('quota_type');
        formInline.chooseTime = chooseTimeData.value?.length ? chooseTimeData.value[0].code : '';
        await getEnergyCodeData();
        await getAnalysisTreeData({
          treeType: formInline.radioValue,
          energyCode: formInline.energyType,
          expandLevel: 2,
        });
        if (
          energyTypeData.value?.length === 0 ||
          analysisObjectData.value?.length === 0 ||
          chooseTimeData.value?.length === 0
        ) {
          tableDataLoading.value = false;
          return;
        }
        queryName = sessionStorage.getItem('ems-energyName');
        energyConservationEnergyCode.value = sessionStorage.getItem('ems-energyConservationEnergyCode');
        kpiDingeType.value = sessionStorage.getItem('ems-kpiDingeType');
        if (queryName === 'home') {
          await increaseData();
          window.sessionStorage.removeItem('energyName');
        }
        await onSubmit();
        formInlineCopy = cloneDeep(formInline);
      } catch (err) {
        tableDataLoading.value = false;
        abnormal.value = false;
      }
    });
    /**
     * 销毁
     */
    onUnmounted(() => {
      sessionStorage.removeItem('energyName');
      sessionStorage.removeItem('ems-energyConservationEnergyCode');
      sessionStorage.removeItem('ems-kpiDingeType');
    });
    return {
      CHOOSETIME,
      dialogFormVisibleAdd,
      dialogFormVisibleEdit,
      addChilde,
      editData, // 修改当前行的数据
      clearFile,
      tableDataLoading,
      formInline,
      radioData,
      analysisObjectExpanedKeys,
      treeLoading,

      treeRaidoChange,
      treeSelectChange,
      energyTypeData,
      analysisObjectData,
      chooseTimeData,
      onSubmit,
      onReset,
      importData,
      downLoad,
      increaseData,
      tableData,
      total,
      onPageSizeChange,
      onCurrentChange,
      diaogAddCancel,
      dialogEditSureFn,
      updateFn,
      sureDelete,
      startMonth,
      endMonth,
      startYear,
      endYear,
      getFile,
      importDatas,
      formatterAlarm,
      thousandSeparation,
      getEnergyCodeData, // 获取能源类型方法
      getAnalysisTreeData, // 获取分析对象的值
      getList, // 获取列表
      formatDate, // 格式化日期
      addSuccessFn, // 新增成功
      lightOrDark,
      abnormal,
      uploadLoading,
      energyConservationEnergyCode,
      kpiDingeType,
      energyTypeOPtionClick,
    };
  },
});
