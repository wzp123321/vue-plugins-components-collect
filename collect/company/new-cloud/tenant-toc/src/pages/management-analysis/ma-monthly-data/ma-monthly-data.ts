import { defineComponent, onMounted, reactive, ref, toRefs, nextTick, onUnmounted } from 'vue';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

import { TOKEN } from '../ma-annual-details/services/services.api';
import {
  MA_IMonthlyErrorDialog,
  MA_EMonthlyNodeType,
  MA_IMonthlyFormInlineType,
  MA_IMonthlyvalueTypeObj,
  MA_IMonthlyBtnType,
  MA_IMonthlyTableType,
  MA_IMonthlyTableVO,
  MA_IMonthlyTableHeadVO,
  MA_IMonthlyNodeDataList,
} from './ma-monthly-data.api';

import { getTenant } from '@/utils/index';
import message from '@/utils/message';
import CommonService from '@/service/pkg/index';
import MonthlyDataService from './service/ma-monthly-data.services';

const MIN_CELL_WIDTH = 132;

export default defineComponent({
  name: 'MonthlyData',
  setup() {
    const destroy$ = new Subject<void>();
    const valueTypeList = ref<MA_IMonthlyvalueTypeObj[]>([]);
    const year = ref<string | undefined>('');
    const nodeFile = ref(); //获取导入节点input框ref
    const dataFile = ref(); //获取导入数据input框ref
    let fileName: MeasureLibrary.fileType; //文件名称

    // 主节点数据源
    const masterDataSource = ref<{ head: MA_IMonthlyTableHeadVO[]; list: MA_IMonthlyTableVO[] }>({
      head: [],
      list: [],
    });
    const incomeDataSource = ref<{ head: MA_IMonthlyTableHeadVO[]; list: MA_IMonthlyTableVO[] }>({
      head: [],
      list: [],
    });
    const costDataSource = ref<{ head: MA_IMonthlyTableHeadVO[]; list: MA_IMonthlyTableVO[] }>({
      head: [],
      list: [],
    });
    const cellWidth = ref<number>(MIN_CELL_WIDTH);

    /**
     * 头部搜索表单
     * @param year 年份
     * @param yearList 年份数据
     * @param isThatYear yearList中是否包含当前年份，有的话默认显示当前年，没有显示第一个
     */
    const formInline = reactive<MA_IMonthlyFormInlineType>({
      year: '',
      valueType: '',
      yearList: [],
      isThatYear: false,
    });

    const btnType = reactive<MA_IMonthlyBtnType>({
      nodeImportLoading: false,
      dataImportLoading: false,
      nodeDownloadLoading: false,
      dataDownloadLoading: false,
      nodeEditing: false,
      nodeDownloadUrl: '/businessAnalyse/exportNodeExcelTemplate',
      dataDownloadUrl: '/businessAnalyse/downloadBusinessDataTemplate',
    });

    /**
     * 表格
     * @param loading 表格loading
     * @param tableData 表格数据
     */
    const tableContentType = reactive<MA_IMonthlyTableType>({
      loading: true,
      tableData: [],
      tableHeadData: {
        month: '',
        incomeDataList: [],
        costDataList: [],
        masterData: [],
      },
      tableHeadIdData: {
        month: '',
        incomeDataList: [],
        costDataList: [],
        masterData: [],
      },
      tableStore: {
        month: 0,
        nodeId: '',
        originValue: '',
        type: MA_EMonthlyNodeType.主节点,
      },
    });

    /**
     * 导入异常弹框
     * @param errorDataList  异常数据
     * @param importErrorVisible  弹框显示与隐藏
     */
    const uploadErrorDialog = reactive<MA_IMonthlyErrorDialog>({
      errorDataList: [],
      importErrorVisible: false,
    });

    // 搜索
    const onSearch = () => {
      if (!formInline.year) {
        message.error(
          ((formInline.valueType === '1' || formInline.valueType === '3') && formInline.yearList?.length === 0) ||
            !formInline.yearList
            ? '暂未有该阶段的成本产生'
            : '请选择查询年份',
        );
        tableContentType.loading = false;
        return;
      }
      year.value = formInline.year;
      getList();
    };
    // 重置
    const onReset = async () => {
      // 2023-10.26屏蔽运营期，默认选中建设期
      formInline.valueType = valueTypeList.value.find((item) => {
        return item.name === '建设期';
      })?.code;
      if (!formInline.valueType) {
        formInline.valueType = valueTypeList.value?.[0]?.code;
      }

      await queryYearList();
      if (formInline.yearList.length > 0) {
        formInline.isThatYear = formInline.yearList.some((item: BenchmarkValueMaintenance.EnergyType) => {
          return item.code === String(new Date().getFullYear());
        });
        formInline.year = formInline.isThatYear ? String(new Date().getFullYear()) : formInline.yearList[0].code;
        year.value = formInline.isThatYear ? String(new Date().getFullYear()) : formInline.yearList[0].code;
      } else {
        formInline.year = undefined;
        year.value = undefined;
      }
      if (!formInline.year) {
        message.error('请选择查询年份');
        tableContentType.loading = false;
        return;
      }
      onSearch();
    };
    const mapHeaderStyle = ({
      row,
      colunm,
      rowIndex,
      columnIndex,
    }: {
      row: string[][];
      colunm: any;
      rowIndex: number;
      columnIndex: number;
    }) => {
      if (rowIndex === 1) {
        return { display: 'none' };
      }
    };
    const mapHeadList = (list: MA_IMonthlyTableHeadVO[]) => {
      return list?.slice(1, list?.length);
    };
    // 获取表格数据
    const getList = async () => {
      try {
        tableContentType.loading = true;
        const obj = {
          ...getTenant(),
          valueType: formInline.valueType,
          year: year.value,
        };
        const res = await MonthlyDataService.queryMonthlyDataList(obj);
        if (res && res.code == 200 && res.success) {
          tableContentType.tableHeadIdData = res.data && res.data.length > 0 ? res.data[0] : {};
          tableContentType.tableHeadData = res.data && res.data.length > 1 ? res.data[1] : {};
          tableContentType.tableData = res.data && res.data.length > 0 ? res.data.slice(2) : [];
          masterDataSource.value = convertDataSource(
            res.data?.masterData?.headList,
            res.data?.masterData?.nodeDataList,
            res.data?.masterData?.editList,
          );
          incomeDataSource.value = convertDataSource(
            res.data?.incomeData?.headList,
            res.data?.incomeData?.nodeDataList,
            res.data?.incomeData?.editList,
          );
          costDataSource.value = convertDataSource(
            res.data?.costData?.headList,
            res.data?.costData?.nodeDataList,
            res.data?.costData?.editList,
          );
          getCellWidth();
        } else {
          tableContentType.tableHeadData = {
            month: '',
            incomeDataList: [],
            costDataList: [],
            masterData: [],
          };
          tableContentType.tableData = [];
        }
      } catch (error) {
        tableContentType.tableHeadData = {
          month: '',
          incomeDataList: [],
          costDataList: [],
          masterData: [],
        };
        tableContentType.tableData = [];
        console.warn('查询月度明细表数据Error========================>', error);
      } finally {
        tableContentType.loading = false;
      }
    };
    // 处理数据
    const convertDataSource = (
      headList: (string | null)[],
      nodeDataList: MA_IMonthlyNodeDataList[],
      editList: boolean[],
    ) => {
      const data: { head: MA_IMonthlyTableHeadVO[]; list: MA_IMonthlyTableVO[] } = {
        list: [],
        head: [],
      };
      if (!nodeDataList || nodeDataList?.length === 0) {
        return data;
      }

      nodeDataList.forEach((childItem, childIndex) => {
        let obj: any = {
          id: childItem.nodeId,
          title: childItem.nodeName,
        };

        headList.forEach((item: string | null, index: number) => {
          if (index > 1) {
            obj = {
              ...obj,
              [item === '合计' ? item : `${formInline.year}_${item}`]: childItem.dataList[index - 2],
            };
          }
          if (childIndex === 0) {
            data.head.push({
              props:
                index === 0
                  ? 'id'
                  : index === 1
                  ? 'title'
                  : index === headList?.length - 1
                  ? '合计'
                  : item
                  ? `${formInline.year}_${item}`
                  : '',
              title:
                index === 0 || index === 1
                  ? `${headList?.[0]}`
                  : index === headList?.length - 1
                  ? '合计'
                  : item
                  ? `${formInline.year}年${item}月`
                  : '',
              month: item ?? '',
              editable: editList[index],
            });
          }
        });
        data.list.push(obj);
      });

      return data;
    };

    // 获取年份
    const queryYearList = async () => {
      try {
        const url = '/baseHead/queryHostingYearsByValueType';
        const obj = {
          ...getTenant(),
          valueType: formInline.valueType,
        };
        const res = await CommonService.queryBaseHead(obj, url);
        if (res.code == 200 && res.success) {
          formInline.yearList = res.data || [];
          if (formInline.yearList.length > 0) {
            formInline.isThatYear = formInline.yearList.some((item: MonthlyData.type) => {
              return item.code === String(new Date().getFullYear());
            });
            formInline.year = formInline.isThatYear ? String(new Date().getFullYear()) : formInline.yearList[0].code;
            year.value = formInline.isThatYear ? String(new Date().getFullYear()) : formInline.yearList[0].code;
          } else {
            formInline.year = '';
            formInline.yearList = [];
            formInline.year = undefined;
            year.value = undefined;
          }
        } else {
          formInline.year = '';
          formInline.yearList = [];
          formInline.year = undefined;
          year.value = undefined;
        }
      } catch (error) {
        formInline.year = '';
        formInline.yearList = [];
        formInline.year = undefined;
        year.value = undefined;
        console.warn('查询年份Error==========================>', error);
      }
    };

    // 导入节点按钮事件 自动触发点击input框
    const onImport = (type: string) => {
      if (type === 'node') {
        nodeFile.value.dispatchEvent(new MouseEvent('click'));
      } else {
        dataFile.value.dispatchEvent(new MouseEvent('click'));
      }
    };

    // 打开文件资源 选择文件
    const getFile = (type: string, event: any) => {
      fileName = event.target.files[0];
      if (fileName != undefined) {
        const file_typename = fileName.name.substring(fileName.name.lastIndexOf('.'));
        if (file_typename === '.xlsx') {
          if (type === 'node') {
            nodeImport(fileName);
          } else {
            dataImport(fileName);
          }
        } else {
          message.error('请选择正确的文件类型！');
        }
      }
    };
    // 导入节点方法
    const nodeImport = async (params: MonthlyData.fileType) => {
      if (btnType.nodeImportLoading) {
        return;
      }
      btnType.nodeImportLoading = true;
      const messageInstance = message.loading('正在导入');
      try {
        const { tenantCode, tenantId } = {
          ...getTenant(),
        };
        const form: any = new FormData(); // FormData 对象
        form.append('file', params); // 文件对象
        form.append('tenantCode', tenantCode); // 文件对象
        form.append('tenantId', tenantId); // 文件对象
        const res = await MonthlyDataService.uploadNode(form);
        if (res && res.data?.length === 0 && res.success && res.code === 200) {
          uploadErrorDialog.importErrorVisible = false;
          btnType.nodeImportLoading = false;
          onSearch();
          messageInstance.close();
          message.success('导入节点模板成功');
        } else if (res && res.data === null && !res.success && res.code === 500) {
          uploadErrorDialog.importErrorVisible = false;
          btnType.nodeImportLoading = false;
          message.error(res.message);
        } else if (res && res.data?.length > 0 && res.success && res.code === 200) {
          uploadErrorDialog.errorDataList = res.data || [];
          uploadErrorDialog.importErrorVisible = true;
          btnType.nodeImportLoading = false;
        } else {
          uploadErrorDialog.importErrorVisible = false;
          btnType.nodeImportLoading = false;
          message.error(res.message);
        }
        nodeFile.value.value = null;
        messageInstance.close();
      } catch (error) {
        uploadErrorDialog.importErrorVisible = false;
        uploadErrorDialog.errorDataList = [];
        btnType.nodeImportLoading = false;
        messageInstance.close();
        nodeFile.value.value = null;
      }
    };
    // 导入数据方法
    const dataImport = async (params: MonthlyData.fileType) => {
      if (btnType.dataImportLoading) {
        return;
      }
      btnType.dataImportLoading = true;
      const messageInstance = message.loading('正在导入');
      try {
        const { tenantCode, tenantId } = {
          ...getTenant(),
        };
        const form: any = new FormData(); // FormData 对象
        form.append('file', params); // 文件对象
        form.append('tenantCode', tenantCode); // 文件对象
        form.append('tenantId', tenantId); // 文件对象
        const res = await MonthlyDataService.uploadData(form);
        if (res && res.data === null && res.success && res.code === 200) {
          uploadErrorDialog.importErrorVisible = false;
          btnType.dataImportLoading = false;
          onSearch();
          messageInstance.close();
          message.success('导入数据模板成功');
        } else if (res && res.data === null && !res.success && res.code === 500) {
          uploadErrorDialog.importErrorVisible = false;
          btnType.dataImportLoading = false;
          message.error(res.message);
        } else if (res && res.data?.length > 0 && res.success && res.code === 200) {
          uploadErrorDialog.errorDataList = res.data || [];
          uploadErrorDialog.importErrorVisible = true;
          btnType.dataImportLoading = false;
        } else {
          uploadErrorDialog.importErrorVisible = false;
          btnType.dataImportLoading = false;
          message.error(res.message);
        }
        dataFile.value.value = null;
        messageInstance.close();
      } catch (error) {
        uploadErrorDialog.importErrorVisible = false;
        uploadErrorDialog.errorDataList = [];
        btnType.dataImportLoading = false;
        messageInstance.close();
        dataFile.value.value = null;
        console.warn('导入Error==========================>', error);
      }
    };
    // 下载节点模板按钮事件
    const onNodeDownload = async () => {
      if (btnType.nodeDownloadLoading) {
        return;
      }
      btnType.nodeDownloadLoading = true;
      const obj = {
        ...getTenant(),
      };
      await CommonService.getFileStreamDownload(
        obj,
        btnType.nodeDownloadUrl,
        '下载节点模板',
        () => {
          btnType.nodeDownloadLoading = false;
        },
        () => {
          btnType.nodeDownloadLoading = false;
        },
      );
    };
    // 下载数据模板按钮事件
    const onDataDownload = async () => {
      if (btnType.dataDownloadLoading) {
        return;
      }
      btnType.dataDownloadLoading = true;
      const obj = {
        ...getTenant(),
      };
      await CommonService.getFileStreamDownload(
        obj,
        btnType.dataDownloadUrl,
        '下载数据模板',
        () => {
          btnType.dataDownloadLoading = false;
        },
        () => {
          btnType.dataDownloadLoading = false;
        },
      );
    };
    //禁用日期
    const mapDisabledDate = (current: Date): boolean => {
      if (formInline.yearList.length !== 0) {
        return (
          current.getFullYear() < Number(formInline.yearList[0].name) ||
          current.getFullYear() > Number(formInline.yearList[formInline.yearList.length - 1].name)
        );
      }
      return true;
    };

    /**
     * 判断当前单元格是否处于编辑状态
     * @param month 月
     * @param nodeId 节点id
     * @returns
     */
    const mapColumnEditing = (month: number, nodeId: string) => {
      return month === tableContentType.tableStore.month && tableContentType.tableStore.nodeId === nodeId;
    };
    /**
     * 判断当前单元格是否可编辑
     * @param month 月
     * @param nodeText 节点文本
     * @param nodeType 节点类型
     * @returns
     */
    const mapColumnEditable = (editable: boolean, nodeText: string) => {
      return editable && nodeText !== '能源费成本-对公支付部分';
    };
    /**
     * 点击单元格 编辑当前单元格
     * @param month 月
     * @param nodeId 节点id
     * @param value 值
     * @returns
     */
    const handleColumnBeEdit = (month: number, nodeId: string, value: string, type: MA_EMonthlyNodeType) => {
      if (btnType.nodeEditing) {
        message.error('数据编辑中');
        return;
      }
      tableContentType.tableStore.month = month;
      tableContentType.tableStore.nodeId = nodeId;
      tableContentType.tableStore.originValue = value;
      tableContentType.tableStore.type = type;

      nextTick(() => {
        const input = document.getElementsByClassName('ma-md-input');
        if (input) {
          (input?.[0] as HTMLInputElement)?.focus();
        }
      });
    };
    /**
     * 键盘回车
     * @param e
     */
    const handleEnter = (e: InputEvent) => {
      if (e?.target) {
        (e?.target as HTMLInputElement)?.blur();
      }
    };
    /**
     * 触发编辑
     * @param e
     */
    const handleNodeEdit = async (e: InputEvent, nodeType: number) => {
      if (nodeType === null || nodeType === undefined) {
        return;
      }
      try {
        const nodeValue = (e.target as HTMLInputElement).value;
        const { valueType, year } = formInline;
        const { month, nodeId, originValue, type } = tableContentType.tableStore;

        if (nodeValue === originValue || (!nodeValue && !originValue) || nodeValue === '-') {
          tableContentType.tableStore.month = 0;
          tableContentType.tableStore.nodeId = '';

          if (type === MA_EMonthlyNodeType.主节点) {
            const index = masterDataSource.value?.list?.findIndex((item) => {
              return item.id === nodeId;
            });
            if (index !== -1) {
              masterDataSource.value.list[index][`${year}_${month}`] = originValue;
            }
          } else if (type === MA_EMonthlyNodeType.收入) {
            const index = incomeDataSource.value?.list?.findIndex((item) => {
              return item.id === nodeId;
            });
            if (index !== -1) {
              incomeDataSource.value.list[index] = {
                ...incomeDataSource.value.list[index],
                [`${year}_${month}`]: originValue,
              };
            }
          }
          return;
        }
        if (btnType.nodeEditing) {
          return;
        }
        btnType.nodeEditing = true;

        const params = {
          valueType: String(valueType),
          year: String(year),
          nodeValue: nodeValue === '' || isNaN(Number(nodeValue)) ? '' : nodeValue,
          month: String(month),
          nodeType,
          nodeId,
          ...TOKEN,
        };
        const res = await MonthlyDataService.updateMonthlyNodeData(params);
        if (res?.success) {
          message.success('编辑成功');
          tableContentType.tableStore.month = 0;
          tableContentType.tableStore.nodeId = '';
          tableContentType.tableStore.originValue = String(Number(nodeValue));

          onSearch();
        } else {
          message.error(res?.message ?? '编辑失败');
        }
      } catch (error) {
        message.error('编辑失败');
        console.warn('编辑单元格Error==========================>', error);
      } finally {
        btnType.nodeEditing = false;
      }
    };

    const getCellWidth = () => {
      nextTick(() => {
        const container = document.getElementsByClassName('tenant-pagecontainer__detail-content');
        if (container?.length) {
          let containerW = document.getElementsByClassName('tenant-pagecontainer__detail-content')?.[0]?.clientWidth;
          let max = 1;
          if (masterDataSource.value?.head?.length > max) {
            max = masterDataSource.value?.head?.length;
          }
          if (incomeDataSource.value?.head?.length > max) {
            max = incomeDataSource.value?.head?.length;
          }
          if (costDataSource.value?.head?.length > max) {
            max = costDataSource.value?.head?.length;
          }

          // 表头第一列为自适应宽度，所以计算平均宽度时需要减去，然后除数需要减去2
          const firstThW = document.querySelector('table thead:first-child tr:first-child th:first-child')?.clientWidth;
          if (firstThW) {
            max = max - 2;
            containerW = containerW - firstThW - (max - 1);
          }

          cellWidth.value = Math.round(containerW / max);
          cellWidth.value = cellWidth.value > MIN_CELL_WIDTH ? cellWidth.value : MIN_CELL_WIDTH;
        }
      });
    };

    onMounted(async () => {
      try {
        const res = await CommonService.queryDictionaryListByCode('value_type');
        if (res && res.code === 200 && res.data.length !== 0) {
          // 2023-10.26 屏蔽运营期，默认选中建设期
          valueTypeList.value = res.data?.filter((item) => item.code + '' !== '2');
          formInline.valueType = valueTypeList.value.find((item) => {
            return item.name === '建设期';
          })?.code;
          if (!formInline.valueType) {
            formInline.valueType = valueTypeList.value?.[0]?.code;
          }
        }
      } catch (error) {
        console.warn('查询value_type字典Error=========================>', error);
      }
      await queryYearList();
      await onSearch();

      fromEvent(window, 'resize')
        .pipe(takeUntil(destroy$))
        .subscribe(() => {
          if (
            masterDataSource.value?.head?.length ||
            incomeDataSource.value?.head?.length ||
            costDataSource.value?.head?.length
          ) {
            getCellWidth();
          }
        });
    });

    onUnmounted(() => {
      destroy$.complete();
      destroy$.next();
    });

    return {
      formInline,
      nodeFile,
      dataFile,
      valueTypeList,
      MA_EMonthlyNodeType,

      ...toRefs(tableContentType),
      ...toRefs(btnType),
      ...toRefs(uploadErrorDialog),

      masterDataSource,
      incomeDataSource,
      costDataSource,
      cellWidth,

      onSearch,
      onReset,
      onImport,
      getFile,
      onNodeDownload,
      onDataDownload,
      queryYearList,
      mapDisabledDate,
      mapColumnEditing,
      mapColumnEditable,
      handleColumnBeEdit,
      handleNodeEdit,
      handleEnter,
      mapHeaderStyle,
      mapHeadList,
    };
  },
});
