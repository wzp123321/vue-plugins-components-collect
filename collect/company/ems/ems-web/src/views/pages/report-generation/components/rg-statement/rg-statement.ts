/*
 * @Description: 报表
 * @Autor: zpwan
 * @Date: 2022-03-22 15:17:46
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-09 16:52:00
 */
import { defineComponent, reactive, toRefs, onMounted, computed, ref, watch } from 'vue';
import axios from 'axios';
// component
import RgCard from '@/views/pages/report-generation/components/rg-card/rg-card.vue';
import { ElProgress, ElSelectV2, ElMessage } from 'element-plus';
import { TeSelectV2 } from '@tiansu/element-plus';
import RgSelect from '../rg-select/rg-select.vue';
// service
import reportGeneration, {
  RG_IDownloadApportionParams,
  RG_IDownloadConservationParams,
} from '@/views/pages/report-generation/services/report-generation.service';
import { Common_IEnergyVO } from '../../../../../services/common/common-api';
import commonService from '@/services/common/common.service';
import { RG_IStateMent, RG_IStatementList, RG_ICardVO, Rg_IDownloadForm } from './rg-report.api';

import { getFormatDateByTimeUnit, FResHandler, formatDate, downloadBlobFile, customClose } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import { disabledProps, FGetElTreeDefaultProps, FGetStorageData, FGetAuthorization } from '@/utils/token';
import message from '@/utils/message';
import {
  differenceInHours,
  differenceInDays,
  isToday,
  isThisMonth,
  isThisYear,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subYears,
} from 'date-fns';

import { TIME_UNITS } from '@/config/enum';
import serviceConfig from '@/config/request';

enum EPath {
  下载科室分摊报表 = '/apportion/report/downloadApportionReport',
  下载积木报表 = '/jimu/energy/analyse/export',
}

const TOTAL_PROGRESS = 100;

export default defineComponent({
  name: 'RgStateMent',
  components: {
    RgCard,
    RgSelect,
    'el-progress': ElProgress,
    'el-select-v2': ElSelectV2,
    'te-select-v2': TeSelectV2,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const { getDictDataByCode } = useCommonController();
    const rgStatement = reactive<RG_IStateMent>({
      downloading: false,
      loading: false,
      showNoData: false,
      errorMessage: '暂无数据',
      stateMentList: [],
    });
    let timer: any;
    const progress = ref<number>(0);
    const treeLoading = ref<boolean>(false);
    const maxLength = ref<number | null>();

    //tab列表
    const tabDataList = computed(
      (): Array<{ label: string; value: RadioDataObject }> =>
        Object.entries(RadioDataObject)
          .filter(([k, v]) => typeof v === 'number')
          .map(([k, v]) => ({ label: k, value: v as RadioDataObject })),
    );

    // 获取报表列表
    const getStateMentList = async () => {
      try {
        rgStatement.loading = true;
        rgStatement.showNoData = false;
        const res = await reportGeneration.getReportDataUrl(2);
        if (res && res.code === 200 && res.data && res.data?.length) {
          rgStatement.stateMentList = res.data;
        } else {
          rgStatement.stateMentList = [];
          rgStatement.showNoData = true;
        }
      } catch (error) {
        rgStatement.showNoData = true;
      } finally {
        rgStatement.loading = false;
      }
    };
    //设置common-transfer可以选中最大数量
    const setMaxLength = (value: string) => {
      let str = null;
      switch (value) {
        case TIME_UNITS.MINUTES:
          str = 500;
          break;
        case TIME_UNITS.HOUR:
        case TIME_UNITS.DAY:
          str = 150;
          break;
        default:
          str = null;
          break;
      }
      if (str && (pageForm.value.treeIds.length > str || pageForm.value.deviceIds.length > str)) {
        const selectedLabel = timeUnitData.value.find((item) => {
          return item.code === value;
        })?.name;
        message.warning(
          `${selectedLabel}时间颗粒度下只支持选择${str}个${
            currentGroupName.value === '设备能耗报表' ? '设备' : '对象'
          }，请先减少选择的设备数量！`,
        );
        return false;
      } else {
        maxLength.value = str;
        pageForm.value.timeUnit = value;
        return true;
      }
    };
    // 初始化
    onMounted(async () => {
      await getStateMentList();
      dialogFormVisible.value = false;
      try {
        timeUnitData.value = await getDictDataByCode('time_unit');
      } catch (error) {
        timeUnitData.value = [];
      }
    });

    // 修改关注状态
    const updateFollowStatus = async (item: reportGenerationHttp.getReportItemUrlType) => {
      const obj = {
        followFlag: item.followFlag === '1' ? '0' : '1',
        id: item.id,
      };
      try {
        const res = await reportGeneration.updateFollowStatus(obj);
        if (res && res.code == 200 && res.success) {
          proxy.$message.success(res.message);
          if (item.followFlag === '0') {
            item.followFlag = '1';
          } else {
            item.followFlag = '0';
          }
        } else {
          return proxy.$message.error(res.message || '修改关注状态失败！');
        }
      } catch (error) {
        return proxy.$message.error('修改关注状态失败！');
      }
    };

    //#region 下载
    const dialogFormVisible = ref<boolean>(false);
    const currentGroupName = ref<string>('能耗报表');
    // 时间颗粒度
    const timeUnitData = ref<Array<{ code: string; name: string }>>([]);

    // 提示实例
    let messageInst: any;
    let axiosCancel: any;

    const defaultTime = computed(() => {
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 0, 0, 0);
      return [startDate, new Date()];
    });

    // 格式
    const format = computed(() => {
      let formatStr = '';
      switch (pageForm.value.timeUnit) {
        case TIME_UNITS.MINUTES:
          formatStr = 'YYYY-MM-DD HH:mm';
          break;
        case TIME_UNITS.HOUR:
          formatStr = 'YYYY-MM-DD HH';
          break;
        case TIME_UNITS.DAY:
          formatStr = 'YYYY-MM-DD';
          break;
        case TIME_UNITS.MONTH:
          formatStr = 'YYYY-MM';
          break;
        case TIME_UNITS.YEAR:
          formatStr = 'YYYY';
          break;
        default:
          formatStr = 'YYYY-MM-DD';
          break;
      }
      return formatStr;
    });

    // 模式
    const mode = computed(() => {
      return pageForm.value.timeUnit === TIME_UNITS.MINUTES || pageForm.value.timeUnit === TIME_UNITS.HOUR
        ? 'datetimerange'
        : pageForm.value.timeUnit === TIME_UNITS.DAY
        ? 'daterange'
        : pageForm.value.timeUnit === TIME_UNITS.MONTH
        ? 'monthrange'
        : 'yearrange';
    });

    // 下载弹框表单
    const pageForm = ref<Rg_IDownloadForm>({
      excelConfigId: '',
      exportType: '',
      startTime: '',
      endTime: '',
      energyCode: [],
      timeUnit: timeUnitData.value?.length && timeUnitData.value[0].code ? timeUnitData.value[0].code : '',
      treeIds: [],
      deviceIds: [],
      radioValue: 1,
      date: [],
    });
    // 能源类型列表
    const energyCodeList = ref<Common_IEnergyVO[]>([]);
    const computedEnergyCodeList = ref<Common_IEnergyVO[]>([]);
    /**
     * 查询能源类型树
     */
    const energyListData = async () => {
      try {
        energyCodeList.value = [];
        energyCodeList.value = await reportGeneration.queryEnergyFlagOneExcludeTotalTree(pageForm.value.radioValue);
        computedEnergyCodeList.value = energyCodeList.value;
        if (currentGroupName.value === '设备能耗报表' && computedEnergyCodeList.value.length > 0) {
          computedEnergyCodeList.value.shift();
        }
        if (energyCodeList.value && energyCodeList.value?.length) {
          pageForm.value.energyCode = [energyCodeList.value[0].code];
          await getAnalysisTreeData();
        }
      } catch (error) {
        energyCodeList.value = [];
      }
    };

    /**
     * 查询不带总能耗的能源类型
     */
    const queryEnergyListWidthoutTotalEnergy = async () => {
      try {
        const res = await commonService.getEnergyTypeWithoutTotalEnergy();
        const convertRes = FResHandler(res);
        if (convertRes?.length) {
          energyCodeList.value = convertRes?.map((item) => {
            return {
              co2Ratio: item?.co2Ratio,
              co2Unit: item?.co2Unit,
              coalRatio: item?.coalRatio,
              coalUnit: item?.coalUnit,
              code: item?.code,
              energyFlag: item?.energyFlag,
              environmentFlag: item?.environmentFlag,
              id: item?.id,
              moneyRatio: item?.moneyRatio,
              moneyUnit: item?.moneyUnit,
              name: item?.name,
              parentCode: item?.parentCode,
              parentName: item?.parentName,
              standardPoints: item?.standardPoints,
              totalEnergyFlag: item?.totalEnergyFlag,
              treeLeaf: item?.treeLeaf,
              treeSort: item?.treeSort,
              unit: item?.unit,
            };
          });
          computedEnergyCodeList.value = energyCodeList.value;
          pageForm.value.energyCode = [convertRes?.[0]?.code];
        } else {
          computedEnergyCodeList.value = [];
          energyCodeList.value = [];
          pageForm.value.energyCode = [];
        }
      } catch (error) {
        computedEnergyCodeList.value = [];
        energyCodeList.value = [];
        pageForm.value.energyCode = [];
      }
    };
    // 树节点列表
    const treeIdList = ref<GlobalModule.CommonObject[]>([]);
    //树总节点数
    const treeNumber = ref(0);
    // 树展开节点数组
    const treeIdExpanedKeys = ref<string[] | number[]>([]);

    // 选择弹窗
    const rgSelectRef = ref();

    const getAnalysisTreeData = async () => {
      const { energyCode } = pageForm.value;
      if (energyCode?.length === 0) {
        return;
      }
      if (currentGroupName.value === '能耗报表') {
        try {
          treeLoading.value = true;
          const objectList = await reportGeneration.energyObjectList({
            treeType: pageForm.value.radioValue,
            energyCode: energyCode[0],
            expandLevel: 2,
          });

          if (objectList && objectList.data) {
            treeIdList.value = objectList.data || [];
            treeNumber.value = objectList.treeNumber || 0;
            treeIdExpanedKeys.value = objectList?.expandTreeIds;

            pageForm.value.treeIds =
              objectList?.data.length > 0
                ? !objectList.data[0]?.lockFlag
                  ? [objectList.data[0].id]
                  : objectList?.data[0]?.childTree?.length
                  ? [objectList?.data[0]?.childTree[0].id]
                  : []
                : [];
          } else {
            treeIdList.value = [];
            treeNumber.value = 0;
            treeIdExpanedKeys.value = [];
            pageForm.value.treeIds = [];
          }
        } catch (error) {
          treeIdList.value = [];
          treeNumber.value = 0;
          treeIdExpanedKeys.value = [];
          pageForm.value.treeIds = [];
        } finally {
          treeLoading.value = false;
        }
      }
      if (currentGroupName.value === '设备能耗报表') {
        await getDeviceData();
      }
      pageFormRef.value?.clearValidate();
    };

    /**
     * 设备
     */
    const device = ref<reportGeneration.DeviceListTypy[]>([]);
    const deviceLoading = ref<boolean>(true);
    const getDeviceData = async () => {
      pageForm.value.treeIds = [];
      device.value = [];
      const { energyCode } = pageForm.value;
      if (energyCode?.length === 0) {
        return;
      }
      deviceLoading.value = true;
      try {
        const deviceList = await reportGeneration.energyDeviceList(energyCode[0]);
        if (deviceList) {
          device.value = deviceList ?? [];
          pageForm.value.deviceIds = deviceList && deviceList.length > 0 ? [deviceList[0].value] : [];
        } else {
          device.value = [];
          pageForm.value.deviceIds = [];
        }
      } catch (error) {
        device.value = [];
        pageForm.value.deviceIds = [];
      } finally {
        deviceLoading.value = false;
      }
    };
    /**
     * 区域、业态、之路切换事件
     */
    const treeRaidoChange = async () => {
      if (pageForm.value.energyCode?.length === 0 || pageForm.value.energyCode[0] !== energyCodeList.value[0].code) {
        pageForm.value.energyCode = energyCodeList.value?.length ? [energyCodeList.value[0].code] : [];
      }
      await energyListData();
    };
    const updateTreeType = (value: number) => {
      pageForm.value.radioValue = value;
    };

    const selectChange = () => {
      rgSelectRef.value?.close();
      getAnalysisTreeData();
    };

    /**
     * 颗粒度变化
     */
    const onTimeUnitChange = (val: string) => {
      if (setMaxLength(val)) {
        initDate();
      }
    };
    //单独触发校验
    const changeValidate = () => {
      pageFormRef.value.validateField('treeIds', () => {});
    };

    // 初始化时间
    const initDate = () => {
      const startDate = new Date();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      const endDate = new Date();
      pageForm.value.date = [startDate, endDate];
    };
    /***
     * 文件类型
     * 不同树类型不同报表类型
     */
    const fileIdList = ref<reportGeneration.FileIdType[]>([]);
    // 查询可下载文件类型列表
    const queryFileTypeList = async () => {
      try {
        fileIdList.value = [];
        const tenantCode = FGetStorageData('energy-corpid') ?? '';
        fileIdList.value = await reportGeneration.energyFileIdList(tenantCode);
      } catch (error) {
        fileIdList.value = [];
      }
    };
    /**
     * 打开下载弹框
     * @param item
     */
    const downloadExport = (item: RG_IStatementList, cardItem: RG_ICardVO) => {
      pageForm.value.radioValue = 1;
      currentGroupName.value = item.groupName;
      pageForm.value.timeUnit =
        timeUnitData.value?.length && timeUnitData.value[0].code ? timeUnitData.value[0].code : '';

      pageForm.value.exportType = 'excel';

      initDate();
      if (item.groupName === '能耗分摊报表') {
        pageForm.value.timeUnit = '1d';
        // 能耗分摊报表---默认前一天
        pageForm.value.date = [subDays(new Date(), 1), subDays(new Date(), 1)];
        queryEnergyListWidthoutTotalEnergy();
      } else if (item.groupName !== '节能报表') {
        energyListData();
        queryFileTypeList();
      } else if (item.groupName === '节能报表') {
        pageForm.value.excelConfigId = cardItem?.id + '';
      }
      setMaxLength(pageForm.value.timeUnit);
      dialogFormVisible.value = true;
    };

    const handleClose = () => {
      dialogFormVisible.value = false;
      rgStatement.downloading = false;
      progress.value = 0;

      if (messageInst) {
        messageInst.close();
      }
      if (axiosCancel) {
        axiosCancel('axios-cancel');
      }
      rgSelectRef.value?.close();
    };

    //表单
    const pageFormRef = ref();

    const validateEnergyCode = (rule: any, value: any, callback: any) => {
      console.log('%c🚀 ~ rg-statement.ts ~ 418行', 'font-size: 18px', pageForm.value, value);
      if (!value.length) {
        callback(new Error('请选择能源类型'));
      } else {
        callback();
      }
    };
    const validateTreeIds = (rule: any, value: any, callback: any) => {
      if (!value.length) {
        callback(new Error('请选择对象'));
      } else {
        callback();
      }
    };
    const validateDeviceIds = (rule: any, value: any, callback: any) => {
      console.log('%c🚀 ~ rg-statement.ts ~ 433行', 'font-size: 18px', pageForm.value, value);

      if (!value.length) {
        callback(new Error('请选择设备'));
      } else {
        callback();
      }
    };

    const rules = reactive({
      energyCode: [
        {
          required: true,
          validator: validateEnergyCode,
          trigger: 'change',
        },
      ],
      treeIds: [
        {
          required: true,
          validator: validateTreeIds,
          trigger: 'change',
        },
      ],
      deviceIds: [
        {
          required: true,
          validator: validateDeviceIds,
          trigger: 'change',
        },
      ],
      timeUnit: [
        {
          required: true,
          message: '请选择时间颗粒',
          trigger: 'change',
        },
      ],
    });
    // 下载
    const onDownloadSubmit = async (formEl: any) => {
      if (!formEl) return;
      await formEl.validate((valid: any, fields: any) => {
        if (valid) {
          if (rgStatement.downloading) {
            // 如果进度条拉满后再次点击即关闭弹框
            if (currentGroupName.value === '能耗分摊报表' && progress.value === TOTAL_PROGRESS) {
              dialogFormVisible.value = false;
              rgStatement.downloading = false;
            }
            return;
          }
          rgStatement.downloading = true;
          if (currentGroupName.value === '能耗分摊报表') {
            // 下载能耗分摊报表
            handleApportionReportDownload();
          } else if (currentGroupName.value === '节能报表') {
            handleConservationReportDownload();
          } else {
            const submitParam = getParam();
            if (!checkSearchParam(submitParam)) {
              rgStatement.downloading = false;
              return;
            } else {
              getFileStreamDownload(
                submitParam,
                EPath.下载积木报表,
                '下载',
                () => {
                  rgStatement.downloading = false;
                  dialogFormVisible.value = false;
                  currentGroupName.value = '';
                  pageForm.value.deviceIds = [];
                },
                () => {
                  rgStatement.downloading = false;
                },
              );
            }
          }
        } else {
          console.log('error submit!', fields);
        }
      });
    };

    /**
     * 节能报表下载
     */
    const handleConservationReportDownload = () => {
      const { date, timeUnit } = pageForm.value;

      if (!date?.length || !date) {
        message.error('请选择日期');
        rgStatement.downloading = false;
        return;
      }
      if (timeUnit === '10m' && Math.abs(differenceInDays(date?.[1] as Date, date?.[0] as Date)) > 6) {
        message.error('日期范围不得超过7天');
        rgStatement.downloading = false;
        return;
      }
      if (timeUnit === '1h' && Math.abs(differenceInDays(date?.[1] as Date, date?.[0] as Date)) > 30) {
        message.error('日期范围不得超过31天');
        rgStatement.downloading = false;
        return;
      }
      if (timeUnit === '1d' && Math.abs(differenceInDays(date?.[1] as Date, date?.[0] as Date)) > 364) {
        message.error('日期范围不得超过365天');
        rgStatement.downloading = false;
        return;
      }
      const projectName = FGetStorageData('ems-platformName') ?? '';
      const loginName = FGetStorageData('energy-loginName') ?? '';
      const params: RG_IDownloadConservationParams = {
        excelConfigId: pageForm.value.excelConfigId,
        exportType: pageForm.value.exportType === 'excel' ? '1' : '2',
        projectName,
        queryParam: {
          loginName,
          timeUnit,
          ...getConservationReportTimeScope(),
          tenantCode: Number(FGetStorageData('energy-corpid') ?? ''),
        },
      };
      getFileStreamDownload(
        params,
        EPath.下载积木报表,
        '导出',
        () => {
          rgStatement.downloading = false;
          dialogFormVisible.value = false;
        },
        () => {
          rgStatement.downloading = false;
        },
      );
    };
    const getConservationReportTimeScope = () => {
      const { date, timeUnit } = pageForm.value;
      const timeScope = {
        startTime: date?.length && date?.[0] ? `${formatDate(date[0], 'yyyy-MM-dd')} 00:00:00` : '',
        endTime: '',
      };
      let isSame = false;
      switch (timeUnit) {
        case '10m':
          isSame = formatDate(date[1], 'yyyy-MM-dd HH:mm') === formatDate(new Date(), 'yyyy-MM-dd HH:mm');
          timeScope.startTime =
            date?.length && date?.[0] ? `${formatDate(date[0] as Date, 'yyyy-MM-dd HH:mm')}:00` : '';
          timeScope.endTime =
            date?.length && date?.[1]
              ? `${formatDate(date[1], 'yyyy-MM-dd HH:mm')}${isSame ? formatDate(date[1] as Date, ':ss') : ':59'}`
              : '';
          break;
        case '1h':
          isSame = formatDate(date[1], 'yyyy-MM-dd HH') === formatDate(new Date(), 'yyyy-MM-dd HH');
          timeScope.startTime =
            date?.length && date?.[0] ? `${formatDate(date[0] as Date, 'yyyy-MM-dd HH')}:00:00` : '';
          timeScope.endTime =
            date?.length && date?.[1]
              ? `${formatDate(date[1], 'yyyy-MM-dd HH')}${isSame ? formatDate(date[1] as Date, ':mm:ss') : ':59:59'}`
              : '';
          break;
        case '1d':
          timeScope.endTime =
            date?.length && date?.[1]
              ? `${formatDate(date[1], 'yyyy-MM-dd')} ${
                  isToday(date?.[1] as Date) ? formatDate(new Date(), 'HH:mm:ss') : '23:59:59'
                }`
              : '';
          break;
        case '1M':
          const isToMonth = date && date?.length === 2 && date[1] && isThisMonth(date[1] as Date);
          timeScope.startTime =
            date?.length && date?.[0] ? `${formatDate(startOfMonth(date[0] as Date), 'yyyy-MM-dd')} 00:00:00` : '';
          timeScope.endTime =
            date?.length && date?.[1]
              ? `${
                  isToMonth
                    ? formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    : `${formatDate(endOfMonth(date[1] as Date), 'yyyy-MM-dd HH:mm:ss')}`
                }`
              : '';
          break;
        case '1y':
          const isToYear = date && date?.length === 2 && date[1] && isThisYear(date[1] as Date);
          timeScope.startTime =
            date?.length && date?.[0] ? `${formatDate(startOfYear(date[0] as Date), 'yyyy-MM-dd')} 00:00:00` : '';
          timeScope.endTime =
            date?.length && date?.[1]
              ? `${
                  isToYear
                    ? formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    : `${formatDate(endOfYear(date[1] as Date), 'yyyy-MM-dd HH:mm:ss')}`
                }`
              : '';
          break;
      }

      return timeScope;
    };
    /**
     * 能耗分摊报表日期禁用回调
     * @param current
     * @returns
     */
    const mapApportionReportDateDisabled = (current: Date) => {
      return current.getTime() > subDays(new Date(), 1).getTime();
    };
    /**
     * 能耗分摊报表下载
     */
    const handleApportionReportDownload = () => {
      const { energyCode, date } = pageForm.value;
      if (!energyCode?.length) {
        message.error('请选择能源类型');
        rgStatement.downloading = false;
        return;
      }
      if (!date?.length || !date) {
        message.error('请选择日期');
        rgStatement.downloading = false;
        return;
      }

      // 2023.01.01-2022.01.01超过一年
      const subYear = subYears(date?.[1] as Date, 5);
      subYear.setHours(0);
      subYear.setMinutes(0);
      subYear.setSeconds(0);

      const sDate = subDays(date?.[0] as Date, 1);
      sDate.setHours(0);
      sDate.setMinutes(0);
      sDate.setSeconds(0);

      if (subYear.getTime() > sDate?.getTime()) {
        message.error('日期范围不得超过5年');
        rgStatement.downloading = false;
        return;
      }
      const params: RG_IDownloadApportionParams = {
        energyCodeList: energyCode,
        startTimeStr: date?.length && date?.[0] ? formatDate(date[0], 'yyyy-MM-dd') : '',
        endTimeStr: date?.length && date?.[1] ? formatDate(date[1], 'yyyy-MM-dd') : '',
      };
      loadProgress();
      getFileStreamDownload(
        params,
        EPath.下载科室分摊报表,
        '导出',
        () => {
          progress.value = 100;
          clearInterval(timer);
          rgStatement.downloading = false;
          dialogFormVisible.value = false;

          currentGroupName.value = '';
        },
        () => {
          progress.value = 0;
          rgStatement.downloading = false;
          clearInterval(timer);
        },
      );
    };
    /**
     * 文件流导出通用接口
     * @param params 请求参数 类型自定义
     * @param reqUrl 请求地址
     * @param cbFn 成功回调
     * @param failCb 失败回调
     */
    const getFileStreamDownload = async <T>(
      params: T,
      reqUrl: string,
      type: string,
      cbFn?: () => void,
      failCb?: () => void,
    ) => {
      messageInst = message.loading(`正在${type}`);
      try {
        const canelToken = axios.CancelToken;
        const res: any = await axios({
          url: `${serviceConfig.BASE_URL}${reqUrl}`,
          method: 'post',
          data: params,
          headers: {
            'content-type': 'application/json',
            tenantCode: FGetStorageData('energy-corpid') ?? '',
            token: FGetStorageData('energy-token') ?? '',
            loginName: FGetStorageData('energy-loginName') ?? '',
            sourceValue: FGetStorageData('ems-sourceValue') ?? '',
            Authorization: FGetAuthorization(),
          },
          cancelToken: new canelToken((c: unknown) => {
            axiosCancel = c;
          }),
          responseType: 'blob',
        });
        if (
          res &&
          res.status === 200 &&
          res.data &&
          res.headers['content-disposition'] &&
          res?.data?.type !== 'application/json'
        ) {
          const fileName =
            res.headers && res.headers['content-disposition']
              ? res.headers['content-disposition'].split('filename=')[1]
              : `数据${type}`;
          downloadBlobFile(res.data, decodeURIComponent(fileName), type, () => {
            if (typeof cbFn === 'function') {
              cbFn();
            }
          });
        } else {
          if (typeof failCb === 'function') {
            failCb();
          }
          messageInst?.close();
          const reader = new FileReader();
          if (res?.data?.size && res?.data?.type.includes('json')) {
            reader.onloadend = (e) => {
              const res = JSON.parse(e.target?.result as string);
              if (Number(res?.errcode) === 401 || res?.code === 401) {
                window.parent.postMessage(
                  {
                    code: Number(res?.errcode) || res.code,
                    message: res.errmsg || res.message,
                    type: 'ems-login-failure',
                  },
                  window.location.origin,
                );
              } else {
                message.error(res?.errmsg ? res?.errmsg : `${type}失败`);
              }
            };
            reader.readAsText(res?.data);
          } else {
            message.error(`${type}失败`);
          }
        }
      } catch (error) {
        if (typeof failCb === 'function') {
          failCb();
        }
        messageInst?.close();
        if ((error as any)?.response?.data?.errcode === '4f000002' || JSON.stringify(error)?.includes('401')) {
          window.parent.postMessage(
            {
              code: '4f000002',
              message: '',
              type: 'ems-login-failure',
            },
            window.location.origin,
          );
        } else {
          // 判断是否超时
          if (
            currentGroupName.value === '能耗分摊报表' &&
            (error as any)?.message?.toLocaleLowerCase()?.includes('timeout')
          ) {
            dialogFormVisible.value = false;
            rgStatement.downloading = false;
            progress.value = 0;
            message.info('报表下载中，请稍后至报告报表管理中查看。');
            clearInterval(timer);
          } else {
            const reader = new FileReader();
            if ((error as any)?.response?.data?.size && (error as any)?.response?.data?.type.includes('json')) {
              reader.onloadend = (e) => {
                const res = JSON.parse(e.target?.result as string);
                if (Number(res?.errcode) === 401 || res?.code === 401) {
                  window.parent.postMessage(
                    {
                      code: res?.errcode,
                      message: res?.errmsg,
                      type: 'ems-login-failure',
                    },
                    window.location.origin,
                  );
                } else {
                  message.error(`${type}失败${res?.errmsg ? '，' + res?.errmsg : ''}`);
                }
              };
              reader.readAsText((error as any)?.response?.data);
            } else {
              // 如果不是手动取消的请求
              if ((error as any)?.message !== 'axios-cancel') {
                message.error(`${type}失败`);
              }
            }
          }
        }
      }
    };
    // 模拟进度条
    const loadProgress = () => {
      let time = 0;
      timer = setInterval(() => {
        const pro = Number((Math.random() * 5).toFixed(0));
        time += 1;
        // 超过60s就会重置
        if (time >= 60) {
          rgStatement.downloading = false;
          progress.value = 0;
          clearInterval(timer);
          return;
        }
        if (time % 2 === 0) {
          progress.value += pro > TOTAL_PROGRESS - progress.value ? TOTAL_PROGRESS - progress.value : pro;
        }
        if (TOTAL_PROGRESS <= progress.value) {
          clearInterval(timer);
        }
      }, 1000);
    };
    const mapProgressText = () => {
      return progress.value === TOTAL_PROGRESS ? '完成' : progress.value;
    };
    const mapProgressBack = () => {
      return progress.value === TOTAL_PROGRESS ? '#52C41A' : '#1890FF';
    };
    /**
     * 提交参数整理
     * @returns
     */
    const getParam = () => {
      const projectName = FGetStorageData('ems-platformName') ?? '';

      const param: reportGeneration.SumbitParamType = {
        excelConfigId: '',
        exportType: '',
        projectName,
        queryParam: {
          energyCode: '',
          timeUnit: '',
          treeIds: undefined,
          deviceIdPointNumbers: undefined,
          tenantCode: FGetStorageData('energy-corpid') ?? '',
        },
      };
      // 如果是能耗报表，根据选择的树类型选择不同templateId
      if (currentGroupName.value === '能耗报表') {
        if (fileIdList.value && fileIdList.value.length > 0) {
          param.excelConfigId =
            fileIdList.value.filter((item) => {
              return +item.templateType == pageForm.value.radioValue;
            })[0]?.templateId ?? '';
        }
        param.queryParam.treeIds = pageForm.value.treeIds.join(',');
      } else if (currentGroupName.value === '设备能耗报表') {
        // 如果是设备能耗报表，固定templateType=4的templateId
        if (fileIdList.value && fileIdList.value.length > 0) {
          param.excelConfigId =
            fileIdList.value.filter((item) => {
              return +item.templateType == 4;
            })[0]?.templateId ?? '';
        }
        console.log('%c🚀 ~ rg-statement.ts ~ 892行', 'font-size: 18px', pageForm.value.deviceIds);
        param.queryParam.deviceIdPointNumbers =
          pageForm.value.deviceIds
            ?.filter((item: number) => {
              return !!item;
            })
            ?.join(',') ?? '';
      }
      param.queryParam.timeUnit = pageForm.value.timeUnit;
      param.queryParam.energyCode =
        pageForm.value.energyCode && pageForm.value.energyCode.length > 0 ? pageForm.value?.energyCode[0] : '';
      if (pageForm.value.date && pageForm.value.date.length > 1) {
        const { startDate, endDate } = getFormatDateByTimeUnit(pageForm.value.timeUnit, pageForm.value.date as Date[]);
        param.queryParam.startTime = startDate;
        param.queryParam.endTime = endDate;
      } else {
        param.queryParam.startTime = '';
        param.queryParam.endTime = '';
      }

      param.exportType = pageForm.value.exportType === 'excel' ? '1' : '2';

      return param;
    };
    /**
     * 提交下载参数验证
     */
    let messageInstance: any;
    const checkSearchParam = (param: reportGeneration.SumbitParamType) => {
      if (messageInstance) {
        messageInstance.close();
      }
      if (!param.queryParam.energyCode && currentGroupName.value !== '节能报表') {
        messageInstance = ElMessage({
          type: 'error',
          message: '请选择能源类型!',
        });
        return false;
      }
      if (currentGroupName.value === '能耗报表') {
        if (!param.queryParam.treeIds || pageForm.value.treeIds?.length === 0) {
          messageInstance = ElMessage({
            type: 'error',
            message: '请选择对象!',
          });
          return false;
        }
      }
      if (currentGroupName.value === '设备能耗报表') {
        if (!param.queryParam.deviceIdPointNumbers || pageForm.value.deviceIds?.length === 0) {
          messageInstance = ElMessage({
            type: 'error',
            message: '请选择设备!',
          });
          return false;
        }
      }
      if (!param.queryParam.timeUnit || !pageForm.value.timeUnit) {
        messageInstance = ElMessage({
          type: 'error',
          message: '请选择时间颗粒!',
        });
        return false;
      }

      if (
        !pageForm.value.date ||
        pageForm.value.date?.length !== 2 ||
        !pageForm.value.date[0] ||
        !pageForm.value.date[1]
      ) {
        messageInstance = ElMessage({
          type: 'error',
          message: '请选择日期！',
        });
        return false;
      }
      if (
        pageForm.value.timeUnit === '10m' &&
        pageForm.value.date &&
        pageForm.value.date?.length === 2 &&
        differenceInHours(pageForm.value.date[1] as Date, pageForm.value.date[0] as Date) > 24
      ) {
        messageInstance = ElMessage({
          type: 'error',
          message: '当前颗粒度下日期跨度不能超过24h',
        });
        return false;
      }
      if (
        param.queryParam.timeUnit === '1h' &&
        pageForm.value.date &&
        pageForm.value.date?.length === 2 &&
        differenceInDays(pageForm.value.date[1] as Date, pageForm.value.date[0] as Date) > 30
      ) {
        messageInstance = ElMessage({
          type: 'error',
          message: '当前颗粒度下日期跨度不能超过31天',
        });
        return false;
      }
      if (
        param.queryParam.timeUnit === '1d' &&
        pageForm.value.date &&
        pageForm.value.date?.length === 2 &&
        differenceInDays(pageForm.value.date[1] as Date, pageForm.value.date[0] as Date) > 365
      ) {
        messageInstance = ElMessage({
          type: 'error',
          message: '当前颗粒度下日期跨度不能超过366天',
        });
        return false;
      }
      return true;
    };
    //#endregion

    onMounted(() => {
      dialogFormVisible.value = false;
    });

    return {
      dialogFormVisible,
      pageForm,
      computedEnergyCodeList,
      treeIdList,
      treeNumber,
      treeIdExpanedKeys,
      currentGroupName,
      device,
      deviceLoading,
      timeUnitData,
      format,
      mode,
      fileIdList,
      disabledProps,
      treeLoading,
      progress,
      defaultTime,
      customClose,
      pageFormRef,
      rules,
      maxLength,
      changeValidate,
      FGetElTreeDefaultProps,
      ...toRefs(rgStatement),
      updateFollowStatus,
      handleClose,
      downloadExport,
      onDownloadSubmit,
      getAnalysisTreeData,
      treeRaidoChange,
      onTimeUnitChange,
      mapProgressText,
      mapProgressBack,
      mapApportionReportDateDisabled,
      updateTreeType,
      rgSelectRef,
      tabDataList,
      selectChange,
    };
  },
  computed: {
    radioDataList: (): Array<{ label: string; value: RadioDataObject }> =>
      Object.entries(RadioDataObject)
        .filter(([k, v]) => typeof v === 'number')
        .map(([k, v]) => ({ label: k, value: v as RadioDataObject })),
    particleSize: (): Array<{ label: string; value: ParticleSize }> =>
      Object.entries(ParticleSize)
        .filter(([k, v]) => typeof v === 'number')
        .map(([k, v]) => ({ label: k, value: v as ParticleSize })),
  },
});

export enum RadioDataObject {
  区域 = 1,
  业态,
  支路,
}

export enum ParticleSize {
  '10分钟' = 0,
  小时,
  天,
}
