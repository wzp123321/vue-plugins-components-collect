import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
// 组件
import { ElMessageBox } from 'element-plus';
import {
  IconBackward,
  IconEditPen,
  IconInfoFilled,
  IconDian,
  IconShui,
  IconZhengqi,
  IconRanqi,
  IconHotwater,
  IconOneThirdRotation,
  IconSheetView,
} from '@arco-iconbox/vue-te';
import PmIncomeConfig from '../pm-income-config/pm-income-config.vue';
import PvFormulaView from './components/pv-formula-view/pv-formula-view.vue';
// 工具
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { transferPercent, getTenant, convertToChinaNum } from '@/utils/index';
import cryptoUtil from '@/utils/crypto';
// service
import commonService from '@/service/pkg/index';
import projectManageService from '../services/project-manage.service';
// api
import { IKeyValue, PmEPageUrl } from '../services/project-manage.api';
import {
  projectStatusList,
  trusteeshipTypeList,
  standardTypeList,
  mapEnergyIconClass,
  mapEnergyIconColor,
  riskRatingList,
} from '../constant/index';
import {
  BenchmarkTypeEnum,
  PM_IFeeNodeType,
  PM_EGrainSharingMode,
  PM_EGrainSharingType,
  PM_EPriceAdjustmentType,
  PM_EAdjustmentTime,
  PM_EPriceType,
  PM_EAdjustmentBasis,
  PM_EProjectIncomeType,
  PM_EProjectPeriodType,
  PM_EGrainSharingObject,
  PM_EDialogType,
} from '../constant/enum';
import { CommonEPageType, CommonICodeName } from '@/service/api';
import {
  PM_IContractNodePeriod,
  PM_IContractPriceAdjust,
  PM_IFeeNodeTypeVO,
  PM_IProjectBasicDetail,
  PM_IProjectDetail,
} from '../pm-add-editor/pm-add-editor.api';
import { PM_IContractDetail, PM_IHostingDetail, PM_IProjectViewDetail, PV_IConvertShareModel } from './pm-view.api';
// hook
import { useEnergyList } from '../hook/useEnergy';
import { FGetStorageData } from '@/utils/storage';
import { mapPeriodListByScope } from '../pm-add-editor/utils';
import { EHostMenuFlag } from '@/config/enum';

export default defineComponent({
  name: 'ProjectView',
  components: {
    ElMessageBox,
    IconBackward,
    IconEditPen,
    IconInfoFilled,
    IconDian,
    IconShui,
    IconZhengqi,
    IconRanqi,
    IconHotwater,
    IconOneThirdRotation,
    IconSheetView,
    PvFormulaView,
    PmIncomeConfig,
  },
  setup() {
    const { queryEnergyList, energyCodeList, energyCodeNameMap, energyNameUnitMap } = useEnergyList();

    const loading = ref(true);
    const route = useRoute();
    const router = useRouter();
    // store
    const store = useStore();
    // 弹框
    const incomeConfigureRef = ref();
    // 抽屉
    const formulaViewRef = ref();
    // 是否展示编辑按钮
    const editorBtnShowFlag = ref<boolean>(false);
    // 省
    const provinceList = ref<IKeyValue[]>();
    // 市
    const cityList = ref<IKeyValue[]>();
    // 区县
    const districtList = ref<IKeyValue[]>();
    // 大区列表
    const regionList = ref<CommonICodeName[]>([]);
    // 是否是iframe加载
    const isIframeLoad = computed(() => {
      return !route.path?.includes('/home/');
    });
    // 项目详情
    const projectDetail = ref<PM_IProjectViewDetail>({
      tenantId: null,
      tenantCode: '',
      projectBasicInfoVO: {
        projectName: '',
        status: '',
        province: '',
        city: '',
        district: '',
        energyManager: '',
        region: '',
        energyPriceInfoList: [],
        trusteeshipDate: '',
        firstBatch: null,
        buildStartTime: '',
        buildEndTime: '',
        startTime: '',
        endTime: '',
        acceptanceTime: '',
        buildingIncome: null,
        projectNumber: [],
        bindingHospitalId: '',
        bindingAreaIds: [],
      },
      contractInfoVO: {
        hostingType: '',
        riskRating: '',
        benchmarkType: '',
        growthRate: '',
        shareModel: [],
        priceAdjustmentType: [],
        feeNodeType: [],
        nodePeriod: [],
      },
      hostingDetailVO: {
        hostingAreaInfoList: [],
        energyConservationList: [],
      },
    });
    // 收益分享模式列表
    const shareModelList = ref<PV_IConvertShareModel[]>([]);
    /**
     * 是否可打开数据配置弹框
     * @param type
     * @returns
     */
    const mapDataConfigureFlag = (type: PM_IFeeNodeType): boolean => {
      return [PM_IFeeNodeType.运维服务费, PM_IFeeNodeType.设备维保服务费].includes(type);
    };
    /**
     * 核算涉及费用
     * @param {PM_IFeeNodeTypeVO} item
     * @returns
     */
    const mapFeeNodeLabel = (item: PM_IFeeNodeTypeVO) => {
      return +item.feeType !== PM_IFeeNodeType.院方部分缴费
        ? PM_IFeeNodeType[+item.feeType]
        : `${PM_IFeeNodeType[+item.feeType]}(${item.energyCodes
            ?.split(',')
            ?.filter((item) => item !== '')
            ?.sort(
              (a, b) =>
                energyCodeList.value.findIndex((cItem) => cItem.code === a) -
                energyCodeList.value.findIndex((cItem) => cItem.code === b),
            )
            ?.map((item) => energyCodeNameMap.value.get(item))
            ?.join('、')})`;
    };
    /**
     * 是否是天溯型
     * @returns
     */
    const mapTiansuFlag = (): boolean => {
      return (
        projectDetail.value.contractInfoVO?.shareModel?.[0]?.incomeShareModel !== null &&
        +projectDetail.value.contractInfoVO?.shareModel?.[0]?.incomeShareModel ===
          PM_EGrainSharingMode.节能收益天溯分享型
      );
    };
    /**
     * 回显单价调整
     * @param {PM_IContractPriceAdjust} priceAdjustment
     * @returns {string}
     */
    const mapPriceAdjustmentLabel = (priceAdjustment: PM_IContractPriceAdjust): string => {
      const {
        energyCode,
        adjustType,
        lower,
        upper,
        adjustTimeType,
        priceType,
        customPrice,
        decimalPoint,
        adjustCardinalityType,
      } = priceAdjustment;
      // 能源名称
      const energyStr = energyCodeNameMap.value.has(energyCode) ? energyCodeNameMap.value.get(energyCode) : '';
      // 单价调差方式名称
      const adjustStr = adjustType !== null ? PM_EPriceAdjustmentType[adjustType] : '';
      // 浮动区间
      const sectionStr = `浮动区间${lower}~${upper}`;
      // 调整时间
      const adjustTimeStr = adjustTimeType !== null ? PM_EAdjustmentTime[adjustTimeType] : '';
      // 单价类型
      const priceTypeStr = priceType !== null ? PM_EPriceType[priceType] : '';
      // 小数位
      const decimalsStr =
        priceType === PM_EPriceType.自定义单价
          ? customPrice !== '' && customPrice !== null
            ? `自定义单价${customPrice}元`
            : ''
          : decimalPoint !== '' && decimalPoint !== null
          ? `保留小数${decimalPoint}位`
          : '';
      // 基准类型
      const cardinalStr = adjustCardinalityType !== null ? PM_EAdjustmentBasis[adjustCardinalityType] : '';
      let names = [adjustStr];
      if (adjustType !== PM_EPriceAdjustmentType.无限风险) {
        if (adjustType !== PM_EPriceAdjustmentType.变动实时调整) {
          names.push(sectionStr);
        }
        names = [...names, adjustTimeStr, priceTypeStr, decimalsStr, cardinalStr];
      }
      // 过滤空数据
      names = names?.filter((item) => !!item);
      return `${energyStr}(${names?.join('、')})`;
    };
    /**
     * 项目收入计算回显
     * @param {PM_IContractNodePeriod} item
     * @returns {string}
     */
    const mapNodePeriodLabel = (item: PM_IContractNodePeriod): string => {
      return `${PM_EProjectIncomeType[item.nodeDivision as any]}(${
        item.periodType !== null && +item.periodType === PM_EProjectPeriodType.全周期
          ? '全周期'
          : item.periodStr
              ?.map((item) => {
                return `第${convertToChinaNum(Number(item))}托管期`;
              })
              ?.join('、')
      })`;
    };
    // 查询详情
    const getProjectDetail = async () => {
      try {
        loading.value = true;
        const res: HttpRequestModule.ResTemplate<PM_IProjectDetail> =
          await projectManageService.queryProjectDetailByCodeAndId<PM_IProjectDetail>({
            ...getTenant(),
          });
        if (res && res.code === 200 && res.data) {
          projectDetail.value.tenantCode = res?.data?.tenantCode;
          projectDetail.value.tenantId = res?.data?.tenantId;
          convertProjectBasicInfo(res?.data?.projectBasicInfoVO);
          convertContractInfo(res?.data?.contractInfoVO);
          convertProjectHostingInfo(res?.data?.hostingDetailVO);
        } else {
        }
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };
    /**
     * 处理基础数据
     * @param {PM_IProjectBasicDetail} data
     */
    const convertProjectBasicInfo = (data: PM_IProjectBasicDetail) => {
      projectDetail.value.projectBasicInfoVO.projectNumber = data?.projectNumber?.length ? data?.projectNumber : [];
      projectDetail.value.projectBasicInfoVO.status = data?.status ?? '';
      projectDetail.value.projectBasicInfoVO.projectName = data?.projectName ?? FGetStorageData('toc-project-name');
      projectDetail.value.projectBasicInfoVO.province = data?.province ?? '';
      projectDetail.value.projectBasicInfoVO.city = data?.city ?? '';
      projectDetail.value.projectBasicInfoVO.district = data?.district ?? '';
      projectDetail.value.projectBasicInfoVO.region = data?.region ?? '';
      projectDetail.value.projectBasicInfoVO.energyManager = data?.energyManager ?? '';
      projectDetail.value.projectBasicInfoVO.firstBatch =
        !!data && data?.firstBatch !== null && data?.firstBatch !== '' ? Number(data?.firstBatch) : 12;
      projectDetail.value.projectBasicInfoVO.buildingIncome =
        data?.buildingIncome !== null ? +data?.buildingIncome : null;

      projectDetail.value.projectBasicInfoVO.trusteeshipDate = data?.hostingStartTime
        ? `${dayjs(new Date(data?.hostingStartTime).getTime()).format('YYYY-MM-DD')}~${dayjs(
            new Date(data?.hostingEndTime).getTime(),
          ).format('YYYY-MM-DD')}`
        : '--';

      // 生成托管周期列表
      store.dispatch(
        'setHostingPeriodList',
        mapPeriodListByScope(
          data?.hostingStartTime && data?.hostingEndTime
            ? [new Date(data?.hostingStartTime), new Date(data?.hostingEndTime)]
            : [],
          projectDetail.value.projectBasicInfoVO.firstBatch + '',
        ),
      );
      store.dispatch(
        'setTrustSheepDateList',
        data?.hostingStartTime && data?.hostingEndTime
          ? [new Date(data?.hostingStartTime), new Date(data?.hostingEndTime)]
          : [] ?? [],
      );
      // 验收时间
      projectDetail.value.projectBasicInfoVO.acceptanceTime = data?.acceptanceTime
        ? dayjs(new Date(data?.acceptanceTime).getTime()).format('YYYY-MM-DD')
        : '';
      projectDetail.value.projectBasicInfoVO.energyPriceInfoList = data?.energyPriceInfoList ?? [];
      projectDetail.value.projectBasicInfoVO.energyPriceInfoList = data?.energyPriceInfoList ?? [];
      projectDetail.value.projectBasicInfoVO.bindingHospitalId = data?.bindingHospitalId ?? null;
      projectDetail.value.projectBasicInfoVO.bindingAreaIds = data?.bindingAreaIds ?? [];
    };
    /**
     * 处理合同信息数据
     * @param {PM_IContractDetail} data
     */
    const convertContractInfo = (data: PM_IContractDetail) => {
      projectDetail.value.contractInfoVO.hostingType = data?.hostingType ?? '';
      projectDetail.value.contractInfoVO.riskRating = data?.riskRating ?? '';
      projectDetail.value.contractInfoVO.benchmarkType = data?.benchmarkType ?? '';
      projectDetail.value.contractInfoVO.growthRate =
        (data?.growthRate ?? '--') !== '--' ? String(transferPercent(Number(data?.growthRate), 100)) : '';
      // 收益分享模式
      projectDetail.value.contractInfoVO.shareModel = Array.isArray(data?.shareModel)
        ? data?.shareModel?.map((item) => {
            return {
              incomeShareModel: item?.incomeShareModel,
              incomeShareObject: item?.incomeShareObject,
              incomeShareType: item?.incomeShareType,
              remark: item?.remark,
            };
          }) ?? []
        : [];
      shareModelList.value = [];
      projectDetail.value.contractInfoVO.shareModel.forEach((item) => {
        // 如果数组中已存在
        const existFlag =
          shareModelList.value?.findIndex(
            (cItem) => item.incomeShareObject !== null && +item.incomeShareObject === cItem.grainSharingObject,
          ) !== -1;
        if (existFlag) {
          shareModelList.value.forEach((cItem) => {
            if (
              cItem.grainSharingObject !== null &&
              item.incomeShareObject !== null &&
              +cItem.grainSharingObject === +item.incomeShareObject
            ) {
              cItem.grainSharingTypeList.push({
                grainSharingType: item.incomeShareType !== null ? +item.incomeShareType : null,
                grainSharingTypeName: item.incomeShareType !== null ? PM_EGrainSharingType[+item.incomeShareType] : '',
              });
              // 排序
              cItem.grainSharingTypeList = cItem.grainSharingTypeList?.sort((a, b) => {
                return Number(a.grainSharingType) - Number(b.grainSharingType);
              });
            }
          });
        } else {
          shareModelList.value.push({
            grainSharingObject: item.incomeShareObject !== null ? +item.incomeShareObject : null,
            grainSharingObjectName:
              item.incomeShareObject !== null ? PM_EGrainSharingObject[+item.incomeShareObject] : '',
            grainSharingTypeList: [
              {
                grainSharingType: item.incomeShareType !== null ? +item.incomeShareType : null,
                grainSharingTypeName: item.incomeShareType !== null ? PM_EGrainSharingType[+item.incomeShareType] : '',
              },
            ],
          });
        }
      });
      // 项目收入计算
      projectDetail.value.contractInfoVO.nodePeriod = Array.isArray(data?.nodePeriod)
        ? data?.nodePeriod?.map((item) => {
            return {
              nodeId: item?.nodeId ?? '',
              nodeDivision: item?.nodeDivision ?? null,
              periodStr: (item?.periodStr as any)?.split(',')?.map((item: string) => Number(item)) ?? [],
              periodType: item?.periodType ?? null,
            };
          }) ?? []
        : [];
      // 单价调差方式
      projectDetail.value.contractInfoVO.priceAdjustmentType = Array.isArray(data?.priceAdjustmentType)
        ? data?.priceAdjustmentType?.map((item) => {
            return {
              energyCode: item?.energyCode,
              adjustType: item?.adjustType !== null ? +item?.adjustType : null,
              lower: item?.lower ?? '',
              upper: item?.upper ?? '',
              adjustTimeType: item?.adjustTimeType !== null ? +item?.adjustTimeType : null,
              priceType: item?.priceType !== null ? +item?.priceType : null,
              customPrice: item?.customPrice ?? '',
              decimalPoint: item?.decimalPoint ?? '',
              adjustCardinalityType: item?.adjustCardinalityType !== null ? +item?.adjustCardinalityType : null,
            };
          }) ?? []
        : [];
      // 核算涉及费用
      projectDetail.value.contractInfoVO.feeNodeType = data?.feeNodeType ?? [];
    };
    /**
     * 处理托管信息
     * @param {PM_IHostingDetail} data
     */
    const convertProjectHostingInfo = (data: PM_IHostingDetail) => {
      projectDetail.value.hostingDetailVO.hostingAreaInfoList = data.hostingAreaInfoList?.length
        ? data.hostingAreaInfoList?.map((item) => {
            return {
              name: item.name,
              energyCode: item.energyCode,
              isSubregion: item.isSubregion,
              price: item.price,
            };
          })
        : [];
      // 节能项目
      projectDetail.value.hostingDetailVO.energyConservationList =
        data.energyConservationList?.map((item) => {
          return {
            projectCode: item?.projectCode ?? [],
            projectName: item?.projectName ?? '',
            energyCode: item?.energyCode ?? '',
            energyName: item?.energyName ?? '',
            treeId: item?.treeId ?? null,
            treeName: item?.treeName ?? '',
            treeType: item?.treeType ?? '',
            regionId: item?.regionId ?? null,
            regionName: item?.regionName ?? '',
          };
        }) ?? [];
    };
    //  获取省份列表
    const queryProvinceList = async () => {
      try {
        const res = await projectManageService.getProvinceList();
        if (res && res.code === 200 && res.data) {
          provinceList.value = res.data;
        } else {
          provinceList.value = [];
        }
      } catch (error) {
        console.warn('省份列表----------------->', error);
        provinceList.value = [];
      }
    };
    // 获取市列表
    const queryCityList = async () => {
      try {
        const res = await projectManageService.getCityListByProvinceCode(
          projectDetail.value.projectBasicInfoVO.province,
        );
        if (res && res.code === 200 && res.data) {
          cityList.value = res.data;
        } else {
          cityList.value = [];
        }
      } catch (error) {
        cityList.value = [];
        console.warn('市列表----------------->', error);
      }
    };
    // 获取区县列表
    const queryDistrictList = async () => {
      try {
        const res = await projectManageService.getCountyListByCityCode(projectDetail.value.projectBasicInfoVO.city);
        if (res && res.code === 200 && res.data) {
          districtList.value = res.data;
        } else {
          districtList.value = [];
        }
      } catch (error) {
        districtList.value = [];
        console.warn('区县列表----------------->', error);
      }
    };
    // 查询大区列表
    const queryRegionList = async () => {
      try {
        const res = await commonService.queryDictionaryListByCode('region');
        if (res && res.code === 200 && res.data) {
          regionList.value = res.data;
        } else {
          regionList.value = [];
        }
      } catch (error) {
        regionList.value = [];
        console.warn('大区列表----------------->', error);
      }
    };
    function isNull(val: any) {
      return val || '--';
    }
    function getNameOfCode(code: string, arr: any[]) {
      const res = arr?.find((item) => {
        return item.code === code;
      });
      return isNull(res?.name);
    }
    function getEnergyName(arr: any[]) {
      const resArr: string[] = [];
      arr?.forEach((item) => {
        resArr.push(item?.energyName || '');
      });
      return isNull(resArr.join(', '));
    }

    const hospitals = ref<{ hospitalId: string; hospitalName: string; multiAreaFlag: boolean }[]>([]);
    let areaMap: { [key in string]: any } = {};
    const hospitalIdArea = ref([]);
    async function getBindProject() {
      try {
        const res = await projectManageService.getBindProject({
          ...getTenant(),
        });
        if (res && res.code === 200 && res.data) {
          hospitals.value = res.data.hospitals;
          areaMap = cloneDeep(res.data.hospitalIdAreaVOMap);
          hospitalIdArea.value = areaMap[projectDetail.value.projectBasicInfoVO.bindingHospitalId];
        } else {
          hospitals.value = [];
        }
      } catch (error) {}
    }

    function getNameOfId(id: string, arr: any[], idStr: string, nameStr: string) {
      const res = arr?.find((item) => {
        return item?.[idStr] === id;
      });
      return isNull(res?.[nameStr]);
    }

    function returnBindProject() {
      const bindAreas: string[] = [];
      if (hospitalIdArea.value?.length > 0) {
        hospitalIdArea.value
          ?.filter((item: any) => {
            return projectDetail.value.projectBasicInfoVO.bindingAreaIds?.includes(item.areaId);
          })
          ?.forEach((item: any) => {
            bindAreas.push(getNameOfId(item.areaId, hospitalIdArea.value, 'areaId', 'areaName'));
          });
        return `${getNameOfId(
          projectDetail.value.projectBasicInfoVO.bindingHospitalId,
          hospitals.value,
          'hospitalId',
          'hospitalName',
        )}${bindAreas?.length ? `(${bindAreas.join(', ')})` : ''}`;
      } else {
        return `${getNameOfId(
          projectDetail.value.projectBasicInfoVO.bindingHospitalId,
          hospitals.value,
          'hospitalId',
          'hospitalName',
        )}`;
      }
    }

    const priceTypeMap = {
      '1': '固定单价',
      '2': '实缴单价',
      '3': '按上一托管期综合单价',
      '4': '按上一自然年综合单价',
    };

    function returnPrice(priceType: string, value: string, energyName: string) {
      if (priceType === '1') {
        return `${priceTypeMap[priceType]}(${value}${energyNameUnitMap.value.get(energyName)})`;
      } else if (priceType === '2') {
        return `${priceTypeMap[priceType]}`;
      } else if (priceType === '3' || priceType === '4') {
        return `${priceTypeMap[priceType]}(首期合同单价${value}${energyNameUnitMap.value.get(energyName)})`;
      }
    }
    /**
     * 处理增长率展示
     * @param benchmarkType
     * @param growthRate
     * @returns
     */
    function mapGrowRate(benchmarkType: string, growthRate: number | null) {
      return benchmarkType === BenchmarkTypeEnum.INCREASE_TYPE && growthRate !== null ? `(${growthRate}%)` : '';
    }

    /**
     * 校验按钮权限
     */
    const mapEditorBtnAuthority = async () => {
      try {
        const res = await commonService.checkHostingMenu({
          ...getTenant(),
          systemFlag: CommonEPageType.项目级页面,
          url: PmEPageUrl.项目级编辑页面,
          isDefaultUrl: '0',
          historyFlag: EHostMenuFlag.不需要,
        });
        editorBtnShowFlag.value = res?.data?.checkResult ?? true;
      } catch (error) {
        editorBtnShowFlag.value = false;
      }
    };
    const mapViewPageAuthority = async () => {
      try {
        const res = await commonService.checkHostingMenu({
          ...getTenant(),
          systemFlag: CommonEPageType.项目级页面,
          url: PmEPageUrl.项目级查看页面,
          isDefaultUrl: '0',
          historyFlag: EHostMenuFlag.需要,
        });
        if (!res?.data?.checkResult) {
          router.push({
            path: '/403',
          });
        }
      } catch (error) {
        router.push({
          path: '/403',
        });
      }
    };

    // 返回
    const onBack = () => {
      router.back();
    };
    /**
     * 打开编辑页面
     */
    const toEditor = () => {
      router.push({
        path: PmEPageUrl.项目级编辑页面,
        query: route.query,
      });
    };
    /**
     * 打开收益分享模式弹框
     * @param {PM_EGrainSharingObject} mode
     * @param {PM_EGrainSharingType} type
     */
    const handleFormulaViewShow = (mode: PM_EGrainSharingObject, type?: PM_EGrainSharingType) => {
      if (formulaViewRef.value) {
        // 如果是固定收益或者其他收益则打开数据配置弹框
        if (type !== undefined && [PM_EGrainSharingType.固定收益, PM_EGrainSharingType.其他收益].includes(type)) {
          handleConfigureDialogShow(type as any, type);
        } else {
          formulaViewRef.value.handleShow(mode);
        }
      }
    };
    /**
     * 打开数据配置弹框
     * @param {PM_EDialogType} mode
     * @param {PM_EGrainSharingType} type
     */
    const handleConfigureDialogShow = (mode: PM_EDialogType, type: PM_EGrainSharingType) => {
      if (incomeConfigureRef.value) {
        incomeConfigureRef.value?.openDialog(mode, type, true);
      }
    };

    onMounted(async () => {
      queryEnergyList();
      if (isIframeLoad.value) {
        mapViewPageAuthority();
        mapEditorBtnAuthority();
      }

      await queryProvinceList();
      if (projectDetail.value.projectBasicInfoVO.province) {
        await queryCityList();
      }
      if (projectDetail.value.projectBasicInfoVO.city) {
        await queryDistrictList();
      }
      queryRegionList();
      getBindProject();
      await getProjectDetail();
    });

    return {
      loading,
      projectDetail,
      projectStatusList,
      provinceList,
      cityList,
      districtList,
      regionList,
      trusteeshipTypeList,
      standardTypeList,
      hospitals,
      hospitalIdArea,
      isIframeLoad,
      editorBtnShowFlag,
      formulaViewRef,
      PM_IFeeNodeType,
      incomeConfigureRef,
      PM_EGrainSharingMode,
      PM_EGrainSharingType,
      riskRatingList,
      shareModelList,

      handleFormulaViewShow,
      isNull,
      getNameOfCode,
      getEnergyName,
      returnBindProject,
      returnPrice,
      mapGrowRate,
      onBack,
      toEditor,
      mapEnergyIconClass,
      mapEnergyIconColor,
      mapDataConfigureFlag,
      handleConfigureDialogShow,
      mapTiansuFlag,
      mapPriceAdjustmentLabel,
      mapNodePeriodLabel,
      mapFeeNodeLabel,
    };
  },
});
