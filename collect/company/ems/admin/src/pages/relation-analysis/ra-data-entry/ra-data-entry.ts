import { defineComponent, onMounted, reactive, ref, toRefs, computed } from 'vue';
// config
import { pageSizes } from '@/config/index';
import { getSessionStorage, timeUnits } from '../utils/index';
import { PARAM_TYPES } from '../ra-node-parameter-manage/ra-node-parameter-manage.api';
// utils
import { useRoute } from 'vue-router';
import { cloneDeep } from 'lodash';
import { startOfMonth } from 'date-fns';
import { formatDate } from '@/utils/index';
// services
import CommonService from '@/services/common/common';
import dataEntryServie from './service/ra-data-entry.service';
// components
import SingleData from './components/ra-de-add-dialog/ra-de-add-dialog.vue';
import DifferenceDate from './components/ra-de-date-dialog/ra-de-date-dialog.vue';
import DifferenceValue from './components/ra-de-value-dialog/ra-de-value-dialog.vue';
import { ElDialog, ElForm, ElMessageBox } from 'element-plus';
import message from '@/utils/message';

/**
 * @param loading loading
 * @param queryParams 查询入参
 * @param paramType 参数类型
 * @param dataEntryForm 头部表单
 * @param timeUnitList 时间颗粒度列表
 * @param total 总数
 * @param dataDetail 编辑详情
 */
interface DataEntryState {
  loading: boolean;
  queryParams: DataEntryModule.DataEntryQueryParams;
  paramType: number;
  dataEntryForm: DataEntryModule.DataEntryForm;
  timeUnitList: DataEntryModule.TimeDTOInfo[];
  total: number;
  dataDetail: GlobalModule.CommonObject;
  isAddFlag: boolean;
  dataSource: DataEntryModule.DataEntryInfo[];
  selectedDataList: DataEntryModule.DataEntryInfo[];
}

export default defineComponent({
  components: {
    SingleData,
    DifferenceValue,
    DifferenceDate,
  },
  setup() {
    const multipleTable = ref(ElForm);
    const route = useRoute();
    const addUpdateDialogRef = ref(ElDialog);
    const differenceValueRef = ref(ElDialog);
    const differenceDateRef = ref(ElDialog);

    //
    const dataEntryState = reactive<DataEntryState>({
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: pageSizes[0],
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
        startTime: '',
        endTime: '',
        paramId: -1,
        timeType: '',
      },
      paramType: -1,
      dataEntryForm: {
        date: [],
      },
      timeUnitList: [],
      total: 0,
      dataDetail: {},
      isAddFlag: true,
      dataSource: [],
      selectedDataList: [],
    });
    // 初始数值用于重置
    let initialParams = {};
    // 参数名
    const paramName = ref();
    // 初始时间颗粒度
    const startTimeType = ref('');
    // 当前时间颗粒度
    const actualTimeType = ref('');

    const columns = computed(() => {
      const type = route.query.paramType ? Number(route.query.paramType) : Number(getSessionStorage('paramType'));
      let list: { key: string; label: string }[] = [];
      switch (type) {
        case PARAM_TYPES.SINGLE_DATA:
        case PARAM_TYPES.ARITHMETIC_MEAN:
          list = [
            {
              key: 'val',
              label: '录入值',
            },
          ];
          break;
        case PARAM_TYPES.DATA_DIFFERENCE:
          list = [
            {
              key: 'startValue',
              label: '录入值1',
            },
            {
              key: 'endValue',
              label: '录入值2',
            },
          ];
          break;
        case PARAM_TYPES.DATE_DIFFERENCE:
          list = [
            {
              key: 'startValue',
              label: '开始时间',
            },
            {
              key: 'endValue',
              label: '结束时间',
            },
          ];
          break;
      }
      return list;
    });
    // 查询
    const onSearch = () => {
      startTimeType.value = dataEntryState.queryParams.timeType;
      actualTimeType.value = dataEntryState.queryParams.timeType;
      queryDataList();
    };
    // 列表查询
    const queryDataList = async () => {
      if (dataEntryState.queryParams.timeType !== actualTimeType.value) {
        dataEntryState.queryParams.timeType = actualTimeType.value;
      }
      try {
        const { date } = dataEntryState.dataEntryForm;
        // if (!date) {
        //   proxy.$message.warning('请选择日期');
        //   return;
        // }
        const { timeType, pageSize, pageNum } = dataEntryState.queryParams;
        dataEntryState.loading = true;
        let res;
        let params: any = {
          endTime: date?.length ? formatDate(date[1], 'yyyy-MM-dd') : '',
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum,
          pageSize,
          paramId: dataEntryState.queryParams.paramId,
          searchCount: true,
          startTime: date?.length ? formatDate(date[0], 'yyyy-MM-dd') : '',
        };
        if (
          dataEntryState.paramType == PARAM_TYPES.SINGLE_DATA ||
          dataEntryState.paramType == PARAM_TYPES.ARITHMETIC_MEAN
        ) {
          params = {
            ...params,
            timeType,
          };
        }
        // 单值
        if (
          dataEntryState.paramType == PARAM_TYPES.SINGLE_DATA ||
          dataEntryState.paramType == PARAM_TYPES.ARITHMETIC_MEAN
        ) {
          res = await dataEntryServie.getSingleDataList(params);
        }
        // 值差
        if (dataEntryState.paramType == PARAM_TYPES.DATA_DIFFERENCE) {
          res = await dataEntryServie.getDifferenceDataList(params);
        }
        // 时差
        if (dataEntryState.paramType == PARAM_TYPES.DATE_DIFFERENCE) {
          res = await dataEntryServie.getDifferenceDateList(params);
        }
        if (res.code == 200 && res.success) {
          dataEntryState.dataSource = res.data.list || [];
          dataEntryState.total = res.data.total;
        } else {
          dataEntryState.dataSource = [];
          dataEntryState.total = 0;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message);
          }
        }
      } catch (err) {
        dataEntryState.dataSource = [];
        dataEntryState.total = 0;
      } finally {
        dataEntryState.loading = false;
      }
    };
    // 重置
    const onReset = async () => {
      dataEntryState.queryParams = {
        ...dataEntryState.queryParams,
        ...initialParams,
      };
      startTimeType.value = dataEntryState.queryParams.timeType;
      await initDateData();
    };
    // 新增弹框显示
    const onAddDialogShow = () => {
      dataEntryState.isAddFlag = true;
      dataEntryState.dataDetail = {};
      switch (dataEntryState.paramType) {
        case PARAM_TYPES.SINGLE_DATA:
        case PARAM_TYPES.ARITHMETIC_MEAN:
          addUpdateDialogRef.value.show();
          break;
        case PARAM_TYPES.DATA_DIFFERENCE:
          differenceValueRef.value.show();
          break;
        case PARAM_TYPES.DATE_DIFFERENCE:
          differenceDateRef.value.show();
          break;
      }
    };
    // 修改
    const onEnergyCodeUpdate = (row: GlobalModule.CommonObject) => {
      dataEntryState.dataDetail = row;
      dataEntryState.isAddFlag = false;
      switch (dataEntryState.paramType) {
        case PARAM_TYPES.SINGLE_DATA:
        case PARAM_TYPES.ARITHMETIC_MEAN:
          addUpdateDialogRef.value.show();
          break;
        case PARAM_TYPES.DATA_DIFFERENCE:
          differenceValueRef.value.show();
          break;
        case PARAM_TYPES.DATE_DIFFERENCE:
          differenceDateRef.value.show();
          break;
      }
    };
    // 单个删除
    const onEnergyCodeDelete = (rowId: number) => {
      ElMessageBox.confirm('是否确认删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            let res;
            const { timeType } = dataEntryState.queryParams;
            // 单值
            if (
              dataEntryState.paramType == PARAM_TYPES.SINGLE_DATA ||
              dataEntryState.paramType == PARAM_TYPES.ARITHMETIC_MEAN
            ) {
              const params = {
                idList: [rowId],
                timeType,
              };
              res = await dataEntryServie.batchSingleDataDelete(params);
            }
            // 值差
            if (dataEntryState.paramType == PARAM_TYPES.DATA_DIFFERENCE) {
              const params = {
                dataIdList: [rowId],
              };
              res = await dataEntryServie.batchValueDelete(params);
            }
            // 时差
            if (dataEntryState.paramType == PARAM_TYPES.DATE_DIFFERENCE) {
              const params = {
                dateIdList: [rowId],
              };
              res = await dataEntryServie.batchHourDelete(params);
            }
            if (res.code == 200 && res.success) {
              queryDataList();
              message.success(res.message || '删除成功');
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                message.error(res.message || '删除失败');
              }
            }
          } catch (error) {
            message.error('删除失败');
          }
        })
        .catch(() => {});
    };
    // 表格中多选框
    const handleSelectionChange = (value: DataEntryModule.DataEntryInfo[]) => {
      dataEntryState.selectedDataList = value;
    };
    // 批量删除
    const onDelete = () => {
      if (dataEntryState.selectedDataList.length < 1) {
        message.error('请选择需要删除的关联数据');
        return;
      }
      ElMessageBox.confirm('是否确认批量删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { timeType } = dataEntryState.queryParams;
          let res;
          try {
            // 单值
            const idList = dataEntryState.selectedDataList.map((item) => {
              return item.id;
            });
            if (
              dataEntryState.paramType == PARAM_TYPES.SINGLE_DATA ||
              dataEntryState.paramType == PARAM_TYPES.ARITHMETIC_MEAN
            ) {
              const params = {
                idList,
                timeType,
              };
              res = await dataEntryServie.batchSingleDataDelete(params);
            }
            // 值差
            if (dataEntryState.paramType == PARAM_TYPES.DATA_DIFFERENCE) {
              const params = {
                dataIdList: idList,
              };
              res = await dataEntryServie.batchValueDelete(params);
            }
            // 时差
            if (dataEntryState.paramType == PARAM_TYPES.DATE_DIFFERENCE) {
              const params = {
                dateIdList: idList,
              };
              res = await dataEntryServie.batchHourDelete(params);
            }
            if (res.code == 200 && res.success) {
              queryDataList();
              dataEntryState.selectedDataList = [];
              message.success(res.message || '操作成功');
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            dataEntryState.selectedDataList = [];
            message.error('操作失败');
          }
        })
        .catch(() => {});
    };
    // 每页多少条改变
    const onPageSizeChange = (value: number) => {
      dataEntryState.queryParams.pageSize = value;
      dataEntryState.queryParams.pageNum = 1;
      queryDataList();
    };
    // 当前页数改变
    const onCurrentChange = (value: number) => {
      dataEntryState.queryParams.pageNum = Math.floor(value);
      queryDataList();
    };
    // 获取本月开始时间到本日时间
    const initDateData = async () => {
      const serverDate = await CommonService.getServerDate();
      const startMonth = startOfMonth(serverDate);
      dataEntryState.dataEntryForm.date = [];
      await onSearch();
    };

    /**
     * 初始化
     */
    onMounted(async () => {
      paramName.value = route.query.paramName ? String(route.query.paramName) : String(getSessionStorage('paramName'));
      dataEntryState.queryParams.paramId = route.query.paramId
        ? Number(route.query.paramId)
        : Number(getSessionStorage('paramId'));
      const timeTypes = route.query.timeTypes ? String(route.query.timeTypes) : String(getSessionStorage('timeTypes'));
      dataEntryState.timeUnitList = !timeTypes
        ? timeUnits.map((item) => {
            return {
              timeCode: item.value,
              timeName: item.label,
            };
          })
        : timeUnits
            .filter((item) => {
              return timeTypes.indexOf(item.value) !== -1;
            })
            .map((item) => {
              return {
                timeCode: item.value,
                timeName: item.label,
              };
            });
      dataEntryState.queryParams.timeType = dataEntryState.timeUnitList[0].timeCode;
      dataEntryState.paramType = route.query.paramType
        ? Number(route.query.paramType)
        : Number(getSessionStorage('paramType'));
      await initDateData();
      // 拷贝重置表单
      initialParams = cloneDeep(dataEntryState.queryParams);
    });

    return {
      ...toRefs(dataEntryState),
      PARAM_TYPES,
      addUpdateDialogRef,
      differenceValueRef,
      differenceDateRef,
      multipleTable,
      pageSizes,
      paramName,
      columns,
      startTimeType,
      actualTimeType,
      onReset,
      onAddDialogShow,
      onDelete,
      onPageSizeChange,
      onCurrentChange,
      onEnergyCodeDelete,
      onEnergyCodeUpdate,
      queryDataList,
      handleSelectionChange,
      onSearch,
    };
  },
});
