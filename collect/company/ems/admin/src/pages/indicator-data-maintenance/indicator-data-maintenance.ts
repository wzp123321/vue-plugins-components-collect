import { defineComponent, reactive, ref, toRefs, onMounted, nextTick } from 'vue';
import { formatEmptyValue, formatDate, getTreeExpandKeys, mapLabelWidth, openBlankUrl } from '../../utils/index';
import commonService from '../../services/common/common';
import { cloneDeep } from 'lodash';
import indicator from './service/indicator-data-maintenance.service';
import { IconExplain } from '@arco-iconbox/vue-te';
import { TeTooltip } from '@tiansu/element-plus';
import { FGetSessionStorageData } from '@/utils/token';
import { batchRemoveStorageData } from '@tiansu/tools';
import message from '@/utils/message';

import { useFileUploadHandler, useVerifyUpload, useFileUpload } from '@/services/download.service';

// 允许的文件格式
const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
};
// 文件大小限制 -MB
const MAXIMUM_SIZE = 10;
// 文件上传地址
const FILE_UPLOAD_PATH = '/admin/benchmarking/correlation/data/upload/template';

interface formInlineType {
  month: any;
  nodeType: string;
  treeType: string;
  keyword: string;
}

const enum ETreeType {
  区域树 = '1',
  业态树 = '2',
  科室树 = '4',
}

export default defineComponent({
  components: {
    IconExplain,
    TeTooltip,
  },
  setup() {
    const nodeTypeData = ref<{ code: string; name: string }[]>([]); // 节点型字典数据
    const expandedKeys = ref<string[]>([]);
    const TREE_TYPE = ETreeType.科室树;

    //树模型数据
    const treeTypeData = ref<{ code: string; name: string }[]>([
      {
        code: ETreeType.区域树,
        name: '区域树',
      },
      {
        code: ETreeType.业态树,
        name: '业态树',
      },
      {
        code: ETreeType.科室树,
        name: '科室树',
      },
    ]);
    const formInline = reactive<formInlineType>({
      month: '',
      nodeType: '',
      keyword: '',
      treeType: FGetSessionStorageData('ems-departmentFlag') ? ETreeType.科室树 : ETreeType.区域树,
    });
    const expandAll = ref(false);

    // 导出loading
    const exportLoading = ref(false);
    let tableMaxWidth = ref(180);
    const columnHeader = ref<any>();
    const totalState = reactive<{
      abnormal: boolean;
      loading: boolean;
      uploadLoading: boolean;
    }>({
      abnormal: false,
      loading: true,
      uploadLoading: false,
    });
    const pageForm = reactive<any>({
      monthStart: '',
      monthEnd: '',
      keys: 1,
    });

    let dialogFormVisible = ref<boolean>(false);

    const tableTreeNameWidth = ref(180); // 表格节点名称最小宽度
    const tableData = ref<any>([]);

    // 禁止选择日期
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date(new Date().setMonth(new Date().getMonth())).getTime();
    };

    const isDepartment = ref(false); //是否是科室树
    const isShowNodeType = ref(false); //是否点击查询后
    /**
     *搜索
     * @param e 区分是否主动点击
     */
    const onSearch = (e?: any) => {
      if (formInline.treeType === ETreeType.科室树) {
        getDepartmentTableData();
      } else {
        getTableList();
      }

      if ((e && formInline.treeType === ETreeType.科室树) || FGetSessionStorageData('ems-departmentFlag')) {
        isDepartment.value = true;
      } else {
        isDepartment.value = false;
      }
      batchRemoveStorageData(['ems-departmentFlag']);
    };
    // 重置
    const onReset = async () => {
      formInline.keyword = '';
      formInline.nodeType = '';
      formInline.treeType = treeTypeData.value?.[0]?.code;
      await init();
      expandAll.value = false;
      expandedKeys.value = [];
      onSearch();
    };
    // 获取主体数据
    const getTableList = async () => {
      totalState.loading = true;
      try {
        expandedKeys.value = [];

        tableTreeNameWidth.value = 180;
        tableMaxWidth.value = 180;
        const params = {
          keyword: formInline.keyword,
          nodeType: formInline.nodeType,
          valueTime: formatDate(formInline.month, 'yyyy-MM'),
          treeType: formInline.treeType,
          parentId: 0,
          level: 4,
        };
        const res = await indicator.queryTreeData(params);
        if (res.code === 200 && res.success) {
          totalState.abnormal = false;
          const arr = cloneDeep(res.data);
          if (res.data.length) {
            arr.shift();
          }
          getTreeNameWidth(arr);
          tableData.value = arr || [];

          expandedKeys.value = getTreeExpandKeys(tableData.value, 'treeId', 'children')?.map((item) => {
            return String(item);
          });

          if (res.data && res.data.length) {
            columnHeader.value = res.data[0].benchmarkingCorrelationDataValueQueryVOList || [];
          }
        } else {
          tableData.value = [];
          columnHeader.value = [];
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message);
          }
        }
      } catch (err: any) {
        tableData.value = [];
        columnHeader.value = [];
        totalState.abnormal = true;
        message.error('操作失败');
      } finally {
        totalState.loading = false;
        isShowNodeType.value = true;
      }
    };
    /**
     * 获取科室树数据
     * @returns
     */
    const getDepartmentTableData = async () => {
      totalState.loading = true;
      try {
        expandedKeys.value = [];

        tableTreeNameWidth.value = 180;
        tableMaxWidth.value = 180;
        const params = {
          keyword: formInline.keyword,
          valueTime: formatDate(formInline.month, 'yyyy-MM'),
          treeType: formInline.treeType,
          parentId: 0,
          level: 4,
        };
        const res = await indicator.queryTreeData(params);
        if (res.code === 200 && res.success) {
          totalState.abnormal = false;
          const arr = cloneDeep(res.data);
          if (res.data.length) {
            arr.shift();
          }
          getTreeNameWidth(arr);
          tableData.value = arr || [];

          // expandedKeys.value = getTreeExpandKeys(tableData.value, 'treeId', 'children')?.map((item) => {
          //   return String(item);
          // });

          if (formInline.keyword === '') {
            expandAll.value = false;
            expandedKeys.value = getTreeExpandKeys(tableData.value, 'treeId', 'children')?.map((item) => {
              return String(item);
            });
          } else {
            expandAll.value = true;
          }

          if (res.data && res.data.length) {
            columnHeader.value = res.data[0].benchmarkingCorrelationDataValueQueryVOList || [];
          }
        } else {
          tableData.value = [];
          columnHeader.value = [];
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return message.error(res.message);
          }
        }
      } catch (err: any) {
        tableData.value = [];
        columnHeader.value = [];

        totalState.abnormal = true;
        return message.error('操作失败');
      } finally {
        totalState.loading = false;
        isShowNodeType.value = false;
      }
    };

    const loadChildren = async (row: any, treeNode: unknown, resolve: (date: any[]) => void) => {
      const params = {
        keyword: formInline.keyword,
        nodeType: formInline.nodeType,
        valueTime: formatDate(formInline.month, 'yyyy-MM'),
        treeType: formInline.treeType,
        parentId: row.treeId,
        level: 4,
      };
      indicator.queryTreeData(params).then((res: any) => {
        if (res?.code === 200 && res.data) {
          res.data.shift();
          resolve(res.data);
        } else {
          resolve([]);
        }
      });
    };
    // 下载模板弹框
    const downLoadDialog = async () => {
      if (exportLoading.value) {
        return;
      }
      dialogFormVisible.value = true;

      pageForm.monthStart = new Date(`${formatDate(new Date(new Date()), 'yyyy-MM')}-01 00:00:00`);
      pageForm.monthEnd = new Date(`${formatDate(new Date(new Date()), 'yyyy-MM')}-01 00:00:00`);
    };
    // 下载模板
    const downLoad = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      const params = {
        endTime: formatDate(pageForm.monthEnd, 'yyyy-MM'),
        nodeType: formInline.nodeType,
        treeType: formInline.treeType,
        startTime: formatDate(pageForm.monthStart, 'yyyy-MM'),
      };
      dialogFormVisible.value = false;
      try {
        await commonService.getFileStreamDownload(
          params,
          '/admin/benchmarking/correlation/data/download/template',
          '下载',
          () => {
            exportLoading.value = false;
          },
          () => {
            exportLoading.value = false;
          },
        );
      } catch (error: any) {
        exportLoading.value = false;
        message.error('下载失败');
      }
    };
    // 导入
    const handleFileUpload = async () => {
      if (totalState.uploadLoading) {
        return false;
      }
      const file = (await useFileUploadHandler(false, Object.keys(ACCEPT_EXTENSIONS).join())) as File;
      // 文件校验
      if (!useVerifyUpload(file, MAXIMUM_SIZE, ACCEPT_EXTENSIONS)) {
        console.log('%c✨✨文件校验错误✨✨', 'font-size: 24px');
        return false;
      }

      totalState.uploadLoading = true;
      try {
        const form = new FormData(); // FormData 对象
        form.append('file', file); // 文件对象
        form.append('treeType', formInline.treeType); // 树类型
        const res = await useFileUpload(form, FILE_UPLOAD_PATH);
        if (res) {
          // 非科室
          if (formInline.treeType !== ETreeType.科室树) {
            getTableList();
          } else {
            getDepartmentTableData();
          }
          if (formInline.keyword === '') {
            expandAll.value = false;
            expandedKeys.value = getTreeExpandKeys(tableData.value, 'treeId', 'children')?.map((item) => {
              return String(item);
            });
          } else {
            expandAll.value = true;
          }
        }
      } catch (error) {
        console.log('handleFileUpload---------------', error);
      } finally {
        totalState.uploadLoading = false;
      }
    };

    let editFlag = 1; //判断是否有单元格在编辑状态
    let nums: any;
    let timer: any; // 定时器
    // 编辑表格单元格
    const editUnit = (data: any, childrenData: any, index: number) => {
      clearTimeout(timer);
      if (editFlag == 0) return message.error('请将先前的单元格编辑完成');
      editFlag = 0;
      nums = cloneDeep(childrenData[index].value);
      childrenData[index].show = true;
      nextTick(() => {
        let input_dom = <HTMLImageElement>document.querySelector(`.input_${index} .el-input__inner`);
        timer = setTimeout(() => {
          input_dom.focus();
        }, 500);
      });
    };
    // input框失去焦点触发事件
    const loseFocus = async (data: any, childrenData: any, index: number) => {
      try {
        editFlag = 1;
        childrenData[index].show = false;
        if (nums == childrenData[index].value) {
          return;
        }
        const obj = {
          correlationIndexId:
            childrenData[index].correlationIndexId || childrenData[index].correlationIndexId == 0
              ? Number(childrenData[index].correlationIndexId)
              : '',
          id: childrenData[index].id || childrenData[index].id == 0 ? Number(childrenData[index].id) : '',
          treeId: data.treeId,
          value: childrenData[index].value || childrenData[index].value == 0 ? childrenData[index].value : '',
          valueTime: formatDate(formInline.month, 'yyyy-MM'),
        };
        const res =
          formInline.treeType === ETreeType.科室树
            ? await indicator.saveDepartmentData(obj)
            : await indicator.saveData(obj);

        if (res.code == 200 && res.success) {
          message.success(res.message);
          childrenData[index].id = res.data;
        } else {
          childrenData[index].value = nums;
          return message.error(res.message);
        }
      } catch (err: any) {
        console.log(err);
        childrenData[index].value = nums;
        message.error('操作失败');
      }
    };
    /**
     * 格式化返回值
     */
    const formatter = (row: any, column: any) => {
      return formatEmptyValue(row[column.property]);
    };
    // 渲染空格
    const formatTreeName = (value: string) => {
      return value?.replaceAll(' ', '&nbsp;');
    };
    /**
     * 自适应节点名称宽度
     */
    const getTreeNameWidth: any = (data: any[]) => {
      let res = null;
      if (!data) {
        return null;
      }
      for (let item of data) {
        const rowWidth = (item.treeLevel + 1) * 20 + 20 + mapLabelWidth(item.name);
        if (rowWidth > tableMaxWidth.value) {
          tableMaxWidth.value = cloneDeep(rowWidth);
        }
        tableTreeNameWidth.value = cloneDeep(tableMaxWidth.value);
        if (!res && item.children && item.children.length > 0) {
          res = getTreeNameWidth(item.children);
        }
      }
      return res;
    };
    // 展开
    const handleExpand = (row: any, expanded: boolean) => {
      if (expandAll.value) {
        return;
      }
      if (expanded) {
        expandedKeys.value.push(row.treeId + '');
      } else {
        expandedKeys.value = expandedKeys.value.filter((item: any) => {
          return item != row.treeId;
        });
      }
    };

    const startMonth = (time: Date) => {
      return time.getTime() > new Date().getTime() || time.getTime() > new Date(pageForm.monthEnd).getTime();
    };
    const endMonth = (time: Date) => {
      return (
        time.getTime() > new Date(new Date().setMonth(new Date().getMonth())).getTime() ||
        time.getTime() < new Date(pageForm.monthStart + '-' + '01').getTime()
      );
    };
    /**
     * 跳转至指标管理
     */
    const goNextPage = () => {
      openBlankUrl('/correlationIndex');
    };
    /**
     * 初始化
     */
    const init = async () => {
      try {
        const promiseArr: any = [commonService.getServerDate(), commonService.getDictionaryData('node_type')];
        const resArr = await Promise.all(promiseArr);
        if (resArr?.[0]) {
          formInline.month = resArr?.[0] ? resArr?.[0] : new Date();
        } else {
          formInline.month = new Date();
        }
        if (resArr?.[1]) {
          nodeTypeData.value = resArr?.[1]?.data ?? [];
          formInline.nodeType = nodeTypeData.value?.[0].code ?? '0';
        } else {
          nodeTypeData.value = [];
          formInline.nodeType = '';
        }
      } catch (error) {
        formInline.month = new Date();
        nodeTypeData.value = [];
        formInline.nodeType = '0';
        totalState.loading = false;
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      formInline.keyword = '';
      formInline.nodeType = '';
      formInline.treeType = treeTypeData.value?.[0]?.code;
      if (FGetSessionStorageData('ems-departmentFlag')) {
        formInline.treeType = ETreeType.科室树;
      }

      await init();
      onSearch();
    });
    return {
      treeTypeData,
      formInline,
      exportLoading,
      expandedKeys,
      isDepartment,
      isShowNodeType,
      expandAll,

      onSearch,
      onReset,
      downLoad,
      ...toRefs(totalState),
      tableData,
      nodeTypeData,
      tableTreeNameWidth,
      formatter,
      formatTreeName,
      onDisableDateCb,
      columnHeader,
      editUnit,
      loseFocus,
      handleFileUpload,
      TREE_TYPE,
      ...toRefs(pageForm),
      dialogFormVisible,
      downLoadDialog,
      pageForm,
      startMonth,
      endMonth,
      handleExpand,
      goNextPage,
      loadChildren,
    };
  },
});
