import { defineComponent, onMounted, reactive, ref, computed, watch } from 'vue';
import { ElTable } from 'element-plus';
import { useStore } from 'vuex';
import { ElMessageBox, ElForm } from 'element-plus';
// config
import { ALARM_MANAGE } from '@/config/enum';
import { pageSizes } from '@/config/config';
import { EAnomalyTypes } from '../energy-anomaly/energy-anomaly.api';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import { useCommonController } from '@/utils/use-common-controller';
import { disabledProps, FGetElTreeDefaultProps } from '@/utils/token';
import { startOfDay, subYears } from 'date-fns';
// services
import CommonService from '@/services/common/common.service';

import alarmManage from './services/alarm-management';
import OperationDialog from './components/am-operation-dialog.vue';
import Log from './components/am-log-dialog.vue';

import { AbnormalType, onPageTo } from './utils/index';
import message from '@/utils/message';

interface formInlineType {
  search: string;
  alarmLocation: number[];
  status: string;
  radioValue: number;
  date: [Date, Date];
  alarmType: string;
  alarmLevel: string;
  energyMode: string;
}
interface type {
  code: string;
  name: string;
}
interface typeId {
  id: number | string;
  name: string;
}
export default defineComponent({
  name: 'alarmManagement',
  components: { OperationDialog, Log },
  setup() {
    const store = useStore();
    const multipleTable = ref(ElTable);
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();
    // 树类型数组
    const radioData = ref(proxy.$emsConfig.treeTypeList);
    const operationRef = ref(ElForm);
    const downAllUrl = '/alarm/download/all';
    const downChangeUrl = '/alarm/exportAllAlarmExcel';
    const alarmObjectExpanedKeys = [1, 2];
    const formInline = reactive<formInlineType>({
      search: '',
      alarmLocation: [],
      status: '',
      date: [new Date(), new Date()],
      radioValue: 1,
      alarmType: '',
      alarmLevel: '',
      energyMode: '',
    });
    const abnormal = ref<boolean>(true);
    const loading = ref<boolean>(true);
    const isData = ref<boolean>(false);
    const dialogAdd = ref<boolean>(false);
    const dialogLog = ref<boolean>(false);
    const nums = ref<number>(0);
    const num = ref<number>(0);
    const sortName = ref<string>('generate_time'); // 排序字段
    const sortNameTable = ref<string>(''); // 排序字段
    const sortCode = ref<string>(''); // 升序降序
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    // 是否是云端
    const isInCloud = computed(() => {
      return store.getters.isCloudEnvironment ?? false;
    });
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizes[0]);
    const total = ref<number>(0);
    const tableData = ref<AlarmModule.CommonObject[]>([]);
    const alarmLocationList = ref<AlarmModule.CommonObject[]>([]); // 告警位置
    const alarmTreeExpanedKeys = ref<number[]>([]); // 展开节点
    const treeLoading = ref<boolean>(false);
    const alarmStatusList = ref<type[]>([]); // 告警状态
    alarmStatusList.value = [
      {
        code: '',
        name: '全部',
      },
    ];
    const businessTypeList = ref<type[]>([]); // 业务分类
    const alarmLevelList = ref<type[]>([]); // 告警等级
    alarmLevelList.value = [
      {
        code: '',
        name: '全部',
      },
    ];

    // 告警类型
    const alarmTypeList = ref<typeId[]>([
      {
        id: '',
        name: '全部',
      },
    ]);

    const energyModeList = ref<type[]>([
      { code: '', name: '全部' },
      { code: '1', name: '区域' },
      { code: '2', name: '业态' },
    ]);
    const rows = ref<AlarmModule.CommonObject | null>();
    const logRows = ref<AlarmModule.CommonObject[]>();
    const logGenerationTime = ref<string>(''); // 告警生成时间
    const alarmIdTypeCheck = ref<number[]>([]);
    const title = ref<string>('');
    let handleSelectArr: number[] = [];
    const operationChangeAlarmArr: string[] = [];
    let isSomeConfirm: boolean = false; // 批量确认拦截
    let isSomeHandle: boolean = false; // 批量处理拦截
    let hasBoundaryAlarm: boolean = false; // 是否勾选边界异常
    const isSingle = ref<boolean>(false); // 判断操作事件是批量操作还是单行操作

    const levelBgColor = (val: string) => {
      if (val === '严重') {
        return '#f4160f';
      }
      if (val === '重要') {
        return '#ff8113';
      }
      if (val === '次要') {
        return '#ffca00';
      }
      if (val === '提示') {
        return '#3997d7';
      }
    };

    // 列表中多选
    const handleSelectionChange = (value: AlarmModule.AlarmList[]) => {
      handleSelectArr = [];
      if (value.length) {
        handleSelectArr = value.map((item: any) => {
          return item.id;
        });
        isSomeConfirm = value.some((val: any) => {
          return val.alarmStatus === '2' ? true : false;
        });
        isSomeHandle = value.some((val: any) => {
          return val.alarmStatus === '3' ? true : false;
        });
        hasBoundaryAlarm = value.some((val: AlarmModule.AlarmList) => {
          return val.alarmTypeId === EAnomalyTypes.边界异常;
        });
      }
    };
    // 操作成功
    const onOpeartionOK = () => {
      handleSelectArr = [];
      isSingle.value = false;
      isSomeConfirm = false;
      isSomeHandle = false;
      hasBoundaryAlarm = false;
      alarmIdTypeCheck.value = [];
      pageSize.value = pageSizes[0];
      getList();
    };
    // 搜索
    const onSearch = () => {
      if (formInline.date === null) {
        return proxy.$message.error('请选择告警时间！');
      }
      // 限制时间范围不能超过一个月--开始时间（取开始时间戳）与结束时间（取开始时间戳）差一个月的大小比较
      if (
        startOfDay(formInline.date[0].getTime()).getTime() <
        startOfDay(subYears(formInline.date[1].getTime(), 1)).getTime()
      ) {
        console.log(startOfDay(formInline.date[0].getTime()), startOfDay(subYears(formInline.date[1].getTime(), 1)));
        message.error('告警查询时间范围不能超过一年');
        return;
      }
      pageNum.value = 1;
      pageSize.value = pageSizes[0];

      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      formInline.alarmLocation = [];
      formInline.status = '';
      formInline.radioValue = 1;
      formInline.date = [new Date(), new Date()];
      formInline.alarmType = '';
      formInline.alarmLevel = '';
      formInline.energyMode = '';
      sortCode.value = '';
      onSearch();
    };

    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          alarmLevel: formInline.alarmLevel,
          alarmStatus: formInline.status,
          businessType: '',
          alarmTypeId: formInline.alarmType,
          endTime: formatDate(formInline.date[1], 'yyyy-MM-dd'),
          keyWords: formInline.search,
          nodeId: formInline.alarmLocation[0],
          nodeType: formInline.energyMode,
          orders: [
            {
              asc: sortCode.value === 'ascending' ? true : false,
              column: `${sortName.value}`,
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
          startTime: formatDate(formInline.date[0], 'yyyy-MM-dd'),
        };
        const res = await alarmManage.queryAlarmList(obj);
        if (res && res.code === 200 && res.success) {
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          abnormal.value = false;
        }
      } catch (error) {
        abnormal.value = false;
      } finally {
        loading.value = false;
      }
    };
    // 排序触发事件
    const sortChange = (value: any) => {
      if (value.prop === 'businessTypeText') {
        sortName.value = 'business_type';
        sortNameTable.value = 'businessTypeText';
      } else if (value.prop === 'alarmLevelText') {
        sortName.value = 'alarm_level';
        sortNameTable.value = 'alarmLevelText';
      } else if (value.prop === 'alarmStatusText') {
        sortName.value = 'alarm_status';
        sortNameTable.value = 'alarmStatusText';
      } else if (value.prop === 'generateTime') {
        sortName.value = 'generate_time';
        sortNameTable.value = 'generateTime';
      }
      sortCode.value = value.order;
      getList();
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
    // 获取告警位置
    const alarmLocation = async () => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(formInline.radioValue, '00000', 2);
        if (res?.data?.length) {
          alarmLocationList.value = res.data ?? [];
          alarmTreeExpanedKeys.value = res?.expandTreeIds ?? [];
          formInline.alarmLocation = [];
        } else {
          alarmLocationList.value = [];
          alarmTreeExpanedKeys.value = [];
          formInline.alarmLocation = [];
        }
      } catch (error) {
        alarmLocationList.value = [];
        alarmTreeExpanedKeys.value = [];
        formInline.alarmLocation = [];
      } finally {
        treeLoading.value = false;
      }
    };

    // 获取告警状态
    const getStatus = async () => {
      try {
        const res = await CommonService.getDictionaryData(ALARM_MANAGE.ALARM_STATUS);
        if (res && res.code === 200 && res.success) {
          const sattusList = res.data || [];
          alarmStatusList.value = alarmStatusList.value.concat(sattusList);
        } else {
          alarmStatusList.value = [];
        }
      } catch (error) {
        alarmStatusList.value = [];
      }
    };

    // 获取告警类型
    const getAlarmType = async () => {
      try {
        const res = await alarmManage.queryAlarmType();
        if (res && res.code === 200 && res.success) {
          alarmTypeList.value = alarmTypeList.value.concat(res.data || []);
        } else {
          alarmTypeList.value = [];
        }
      } catch (error) {
        alarmTypeList.value = [];
      }
    };

    // 获取业务分类
    const getBusinessType = async () => {
      try {
        const res = await CommonService.getDictionaryData(ALARM_MANAGE.BUSSINESS_TYPE);
        if (res && res.code === 200 && res.success) {
          businessTypeList.value = res.data || [];
          businessTypeList.value.unshift({
            code: '',
            name: '全部',
          });
        } else {
          // proxy.$message.error(res.message || '获取业务状态失败');
        }
      } catch (error) {
        // console.log('error------------', error);
        // proxy.$message.error(error.message || '获取业务状态失败');
      }
    };
    // 获取告警等级
    const getAlarmLevel = async () => {
      try {
        const res = await CommonService.getDictionaryData(ALARM_MANAGE.ALARM_LEVEL);
        if (res && res.code === 200 && res.success) {
          // alarmLevelList.value = res.data || [];
          // alarmLevelList.value.unshift({
          //   code: '',
          //   name: '全部',
          // });
          const levelList = res.data || [];
          alarmLevelList.value = alarmLevelList.value.concat(levelList);
        } else {
          // proxy.$message.error(res.message || '获取告警等级失败');
        }
      } catch (error) {
        // console.log('error------------', error);
        // proxy.$message.error(error.message || '获取告警等级失败');
      }
    };

    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };

    // 导出全部
    const downLoadAll = () => {
      const obj = {
        alarmLevel: formInline.alarmLevel,
        alarmSystem: formInline.alarmLocation[0],
        keyword: formInline.search,
        status: formInline.status,
        type: formInline.alarmType,
        startDate: formatDate(formInline.date[0], 'yyyy-MM-dd'),
        endDate: formatDate(formInline.date[1], 'yyyy-MM-dd'),
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: pageNum.value,
        searchCount: true,
      };
      ElMessageBox.confirm('是否全部导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          await downloadAsync(obj, downAllUrl, '全部导出');
        })
        .catch((error: Error) => {
          console.log('error----------', error);
        });
    };

    // 选中导出
    const downLoadChange = () => {
      if (
        startOfDay(formInline.date[0].getTime()).getTime() <
        startOfDay(subYears(formInline.date[1].getTime(), 1)).getTime()
      ) {
        console.log(startOfDay(formInline.date[0].getTime()), startOfDay(subYears(formInline.date[1].getTime(), 1)));
        message.error('告警导出时间范围不能超过一年');
        return;
      }
      if (handleSelectArr.length <= 0) {
        // return proxy.$message.warning('请先勾选需要导出的告警信息');
        ElMessageBox.confirm('是否导出全部？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            const obj = {
              alarmLevel: formInline.alarmLevel,
              alarmStatus: formInline.status,
              businessType: '',
              alarmTypeId: formInline.alarmType,
              startTime: formatDate(formInline.date[0], 'yyyy-MM-dd'),
              endTime: formatDate(formInline.date[1], 'yyyy-MM-dd'),
              keyWords: formInline.search,
              nodeId: formInline.alarmLocation[0],
              nodeType: formInline.energyMode,
              alarmIds: handleSelectArr,
              exportAllFlag: true,
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
            await downloadAsync(obj, downChangeUrl, '导出');
          })
          .catch((error: Error) => {
            console.log('error----------', error);
          });
      } else {
        ElMessageBox.confirm('是否导出选中项？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            await downloadAsync({ alarmIds: handleSelectArr, exportAllFlag: false }, downChangeUrl, '导出');
          })
          .catch((error: Error) => {
            console.log('error----------', error);
          });
      }
    };
    // 导出方法
    const downloadAsync = async (params: any, url: string, message: string) => {
      try {
        await CommonService.getFileStreamDownload(params, url, message);
      } catch (error) {
        return proxy.$message.error('导出失败');
      }
    };

    // 批量确认
    const editAll = () => {
      if (handleSelectArr.length <= 0) {
        message.warning('请先勾选需要批量确认的告警信息');
        return;
      }
      if (isSomeConfirm || isSomeHandle) {
        message.warning('勾选对象已确认，请重新选择');
        return;
      }
      if (hasBoundaryAlarm) {
        message.warning('边界异常只可在能源异常功能中处理，本次操作将不做处理。');
      }

      const obj = {
        alarmIds: handleSelectArr,
        operateType: '2',
        handleRemarks: '',
      };
      setTimeout(
        () => {
          botchOperation(obj);
        },
        hasBoundaryAlarm ? 800 : 0,
      );
    };

    // 批量处理
    const handleAll = () => {
      if (handleSelectArr.length <= 0) {
        return proxy.$message.warning('请先勾选需要批量处理的告警信息');
      }
      if (isSomeHandle) {
        return proxy.$message.warning('勾选对象已处理，请重新选择');
      }
      if (hasBoundaryAlarm) {
        message.warning('边界异常只可在能源异常功能中处理，本次操作将不做处理。');
      }
      title.value = '批量处理';
      alarmIdTypeCheck.value = handleSelectArr;
      nums.value++;
      dialogAdd.value = true;
    };
    watch(
      () => tableData.value,
      newVal => {
        if (newVal.length === 0) {
          abnormal.value = false;
        } else {
          abnormal.value = true;
        }
      },
      {
        immediate: true,
      },
    );

    // 确认
    const onEdit = (value: AlarmModule.AlarmList) => {
      const obj = {
        alarmId: value.id,
        operateType: '2',
        handleRemarks: '',
      };
      singleOperation(obj);
    };

    // 处理
    const onHandle = (value: AlarmModule.AlarmList) => {
      isSingle.value = true;
      title.value = '处理';
      rows.value = value;
      nums.value++;
      dialogAdd.value = true;
    };

    // 撤销
    const onRevoke = async (value: AlarmModule.AlarmList) => {
      const obj = {
        alarmId: value.id,
        operateType: '4',
        handleRemarks: '',
      };
      singleOperation(obj);
    };
    // 操作单个
    const singleOperation = async (obj: any) => {
      try {
        const res = await alarmManage.operationAlarm(obj);
        if (res && res.code === 200 && res.success) {
          proxy.$message.success(res.message || '操作成功');
          onOpeartionOK();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '操作失败');
          }
          onOpeartionOK();
        }
      } catch (error) {
        proxy.$message.error('操作失败');
        onOpeartionOK();
      }
    };

    // 批量操作
    const botchOperation = async (obj: any) => {
      try {
        const res = await alarmManage.operationAlarmBotch(obj);
        if (res && res.code === 200 && res.success) {
          proxy.$message.success(res.message || '批量确认成功');
          onOpeartionOK();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '批量确认失败');
          }
          onOpeartionOK();
        }
      } catch (error) {
        proxy.$message.error('批量确认失败');
        onOpeartionOK();
      }
    };

    // 日志
    const onLog = async (value: AlarmModule.AlarmList) => {
      logGenerationTime.value = value.generateTime;
      try {
        const obj = {
          alarmId: value.id,
        };
        const res = await alarmManage.queryAlarmDetails(obj);
        if (res && res.code === 200 && res.success) {
          logRows.value = res.data || [];
          num.value++;
          dialogLog.value = true;
        } else {
          dialogLog.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message || '查看日志失败');
          }
        }
      } catch (error) {
        dialogLog.value = false;
        return proxy.$message.error('查看日志失败');
        // console.log('error------------', error);
      }
    };

    const toDetail = (value: AlarmModule.AlarmList) => {
      const detailParams = {
        alarmId: value.id,
        alarmTypeId: value.alarmTypeId,
        treeId: value.nodeId,
      };
      alarmManage.queryJumpDetails(detailParams).then(res => {
        if (res?.success) {
          const alarmDetail = res.data ?? {};
          let params: GlobalModule.CommonObject = {
            treeId: alarmDetail.treeId,
            treeType: Number(alarmDetail.treeType),
            energyCode: alarmDetail.energyCode,
            transferDate: alarmDetail.abnormalTime,
          };
          switch (detailParams.alarmTypeId) {
            case AbnormalType.CORRELATION:
              // 参数列表
              const browserParamList = alarmDetail.abnormalCorrelationDataList
                ? alarmDetail.abnormalCorrelationDataList.map(
                    (item: EnergyAnomalyModule.AbnormalCorrelationDataList, index: number) => {
                      const { paramName } = item;
                      return {
                        paramName,
                      };
                    },
                  )
                : [];
              params = {
                ...params,
                browserParamList,
              };
              break;
            case AbnormalType.CONTRAST:
              params = {
                ...params,
                contrastId: alarmDetail.contrastTreeId,
              };
              break;
            case AbnormalType.RANK:
              params = {
                ...params,
                groupId: alarmDetail.groupId,
              };
              break;
            case AbnormalType.RATIO:
              params = {
                ...params,
                energyCode: [alarmDetail.energyCode],
                timeUnit: '1h',
                date: [alarmDetail.predictTimestamp, alarmDetail.currentTimestamp],
              };
              break;
            case AbnormalType.BOUNDARY:
              params = {
                ...params,
                energyCode: [alarmDetail.energyCode],
                timeUnit: '1d',
                date: [alarmDetail.startTime, alarmDetail.endTime],
              };
              break;
          }
          onPageTo(detailParams.alarmTypeId, params);
        } else {
          proxy.$message.error(res.message);
        }
      });
    };

    const modeChange = (value: string) => {
      if (value) {
        formInline.radioValue = Number(value);
        radioData.value = [];
      } else {
        formInline.radioValue = 1;
        radioData.value = proxy.$emsConfig.treeTypeList;
      }
      alarmLocation();
    };
    onMounted(() => {
      onSearch();
      getStatus();
      getAlarmType();
      getBusinessType();
      getAlarmLevel();
      alarmLocation();
    });
    return {
      formInline,
      alarmObjectExpanedKeys,
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
      alarmLocationList,
      alarmStatusList,
      businessTypeList,
      alarmLevelList,
      alarmTypeList,
      energyModeList,
      operationRef,
      rows,
      title,
      dialogAdd,
      nums,
      num,
      operationChangeAlarmArr,
      alarmIdTypeCheck,
      dialogLog,
      logRows,
      isSingle,
      logGenerationTime,
      sortName,
      sortCode,
      isData,
      sortNameTable,
      radioData,
      disabledProps,
      alarmTreeExpanedKeys,
      treeLoading,
      EAnomalyTypes,
      isInCloud,

      FGetElTreeDefaultProps,
      onSearch,
      onReset,
      handleSelectionChange,
      getList,
      onPageSizeChange,
      onCurrentChange,
      onDisableDateCb,
      downLoadAll,
      downLoadChange,
      editAll,
      handleAll,
      onEdit,
      onHandle,
      onRevoke,
      onLog,
      onOpeartionOK,
      sortChange,
      alarmLocation,
      levelBgColor,
      toDetail,
      modeChange,
    };
  },
});
