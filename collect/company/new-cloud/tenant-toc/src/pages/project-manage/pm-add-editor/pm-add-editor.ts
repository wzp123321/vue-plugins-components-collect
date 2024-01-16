import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';

import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { transferPercent, floatDivide, formatDateStamp, getTenant, randomNumber32 } from '@/utils/index';
import message from '@/utils/message';
import { useStore } from 'vuex';
// 组件
import {
  IconEditPen,
  IconBackward,
  IconInfoFilled,
  IconDian,
  IconShui,
  IconZhengqi,
  IconRanqi,
  IconHotwater,
  IconOneThirdRotation,
} from '@arco-iconbox/vue-te';
import { ElForm, ElMessageBox, ElDivider } from 'element-plus';
import PaeAccountantExpense from './components/pae-accountant-expense/pae-accountant-expense.vue';
import PaeUnitPriceAdjustment from './components/pae-unit-price-adjustment/pae-unit-price-adjustment.vue';
import PaeGrainSharing from './components/pae-grain-sharing/pae-grain-sharing.vue';
import PaeIncomeCalculation from './components/pae-income-calculation/pae-income-calculation.vue';

import projectManageService from '../services/project-manage.service';
import commonService from '@/service/pkg/index';
import {
  SearchEnergyProject,
  ProjectDetail,
  IKeyValue,
  EnergyCodePrice,
  ContractInfoVO,
  ProjectBasicInfoVO,
  HostingDetailVO,
  SearchDetailVO,
  SearchTreeParams,
  TreeRes,
} from '../services/project-manage.api';
import { CommonICodeName, Common_IObject } from '../../../service/api/index';
// config
import { treeTypeList } from '@/config/index';
// hook
import { useEnergyList } from '../hook';
import { useUserRoleController } from '../../../hook/index';

import {
  projectStatusList,
  trusteeshipTypeList,
  riskRatingList,
  projectTypeList,
  standardTypeList,
  MAX_INPUT_LEN_20,
  MAX_INPUT_LEN_40,
  defaultTreeProps,
  mapEnergyIconClass,
  mapEnergyIconColor,
  PM_TIANSU_NODE_ID,
} from '../constant/index';
import {
  BenchmarkTypeEnum,
  PM_EGrainSharingMode,
  PM_EPriceAdjustmentType,
  PM_EPriceType,
  PM_EProjectIncomeType,
  PM_EProjectPeriodType,
  PM_IFeeNodeType,
} from '../constant/enum';
import { checkPriceAdjustTypeChange, checkShareModeChange, mapPeriodListByScope } from './utils';
import { FGetStorageData } from '@/utils/storage';

export default defineComponent({
  name: 'ProjectAddEditor',
  components: {
    ElMessageBox,
    ElDivider,
    IconBackward,
    IconEditPen,
    IconInfoFilled,
    IconDian,
    IconShui,
    IconZhengqi,
    IconRanqi,
    IconHotwater,
    IconOneThirdRotation,
    PaeAccountantExpense,
    PaeUnitPriceAdjustment,
    PaeGrainSharing,
    PaeIncomeCalculation,
  },
  setup() {
    const { queryEnergyList, energyCodeList, energyCodeNameMap, energyCodeUnitMap } = useEnergyList();
    const { queryUserRole, mapUserIsOperatorExperts, mapUserIsFinancialExperts } = useUserRoleController();
    // store
    const store = useStore();
    // route
    const route = useRoute();
    // router
    const router = useRouter();
    // 项目收入计算组件实例
    const incomeCalculationRef = ref();

    const initialValue = {
      id: 0,
      projectName: '',
      code: '',
      name: '',
      province: '',
      city: '',
      district: '',
      region: '',
      startTime: '',
      firstBatch: '',
      buildingIncome: '',
      endTime: '',
      hostingType: '',
      riskRating: '',
      benchmarkType: '',
      gainSharing: '',
      status: '',
      energyManager: '',
      operationalPeriod: [],
      trusteeshipDate: [],
      acceptanceTime: '',
      energyCode: [],
      hasPartnerShare: '1',
      energyPriceList: [],
      trusteeshipType: '',
      increaseRate: '',
      shareModel: [],
      priceAdjustmentType: [],
      nodePeriod: [],
      feeNodeType: [],
      trusteeshipAreas: [],
      depositAreas: [],
      energyProjects: [],
      buildEndTime: '',
      buildStartTime: '',
      projectNumber: [''],
      hostingEndTime: '',
      hostingStartTime: '',
      bindingHospitalId: '',
      bindingAreaIds: [],
    };
    // 页面加载的值
    const originalValue: SearchDetailVO = {
      projectBasicInfoVO: {
        projectNumber: [''],
        city: '',
        district: '',
        region: '',
        endTime: '',
        energyManager: '',
        energyPriceInfoList: [],
        province: '',
        hostingStartTime: '',
        hostingEndTime: '',
        startTime: '',
        status: '',
        firstBatch: '',
        buildingIncome: '',
        acceptanceTime: '',
        bindingHospitalId: '',
        bindingAreaIds: [],
      },
      contractInfoVO: {
        benchmarkType: '',
        growthRate: '',
        hostingType: '',
        priceAdjustmentType: [],
        riskRating: '',
        shareModel: [],
        nodePeriod: [],
        feeNodeType: [],
      },
      hostingDetailVO: {
        energyConservationList: [],
        hostingAreaInfoList: [],
      },
      tenantCode: '',
      tenantId: 0,
    };
    // 项目详情
    const projectDetail = ref<ProjectDetail>(initialValue);
    // loading
    const loading = ref(true);
    // 是否加载错误
    const isError = ref(false);
    // 编辑loading
    const editorLoading = ref(false);
    // 基础信息表单
    const baseForm = ref(ElForm);
    // 合同表单
    const contractForm = ref(ElForm);
    // 托管表单
    const hostingForm = ref(ElForm);
    // 是否从未编辑过
    const neverEditor = ref<boolean>(false);
    // 大区列表
    const regionList = ref<CommonICodeName[]>([]);
    // 是否是iframe加载
    const isIframeLoad = computed(() => {
      return !route.path?.includes('/home/');
    });
    // 是否有返回按钮
    const hasBackFlag = computed(() => {
      return route.path.includes('/home/');
    });
    // 省
    const provinceList = ref<IKeyValue[]>();
    // 市
    const cityList = ref<IKeyValue[]>();
    // 区县
    const districtList = ref<IKeyValue[]>();
    // 能源经理
    const energyManagerList = ref<IKeyValue[]>([]);
    // 自定义校验项目编码
    const validateProjectNumber = (rule: any, value: any, callback: any) => {
      const flag = projectDetail.value?.projectNumber?.some((item) => {
        return item === '';
      });
      if (flag) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    // 自定义校验所属地区
    const validateArea = (rule: any, value: any, callback: any) => {
      if (!projectDetail.value?.province || !projectDetail.value?.city || !projectDetail.value?.district) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    // 基本信息表单校验
    const projectBaseRules = {
      projectNumber: [
        {
          required: true,
          validator: validateProjectNumber,
          trigger: 'blur',
        },
      ],
      status: [
        {
          required: true,
          trigger: 'change',
          message: ' ',
        },
      ],
      province: [
        {
          validator: validateArea,
          trigger: 'blur',
        },
      ],
      city: [
        {
          validator: validateArea,
          trigger: 'blur',
        },
      ],
      district: [
        {
          validator: validateArea,
          trigger: 'blur',
        },
      ],
      region: [
        {
          required: true,
          trigger: 'change',
          message: ' ',
        },
      ],
      energyCode: [
        {
          required: true,
          trigger: 'blur',
          message: ' ',
        },
      ],
      trusteeshipDate: [
        {
          required: true,
          trigger: 'blur',
          message: ' ',
        },
      ],
      energyPriceList: [
        {
          required: true,
          trigger: 'blur',
          message: ' ',
        },
      ],
    };
    // 自定义校验基准类型
    const validateBenchmarkType = (rule: any, value: any, callback: any) => {
      if (
        !projectDetail.value?.benchmarkType ||
        (projectDetail.value.benchmarkType === BenchmarkTypeEnum.INCREASE_TYPE &&
          checkIsEmpty(projectDetail.value.increaseRate))
      ) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    // 自定义校验收益分享模式
    const validateShareModel = (rule: any, value: any, callback: any) => {
      // 如果国网/资方或者院方都没勾选、勾了国网/资方或者院方没有勾选具体收益类型的
      const flag =
        projectDetail.value.shareModel?.some(
          (item) =>
            item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 &&
            item.incomeShareObject !== null &&
            item.incomeShareType === null,
        ) ||
        projectDetail.value.shareModel?.every(
          (item) => item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 && item.incomeShareObject === null,
        );
      console.log('---------', projectDetail.value.shareModel, flag);
      if (flag) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    // 自定义校验单价调整方式
    const validatePriceAdjust = (rule: any, value: any, callback: any) => {
      const countFlag = (type: PM_EPriceType, price: string) => {
        // 2023-11-17-小数位可以不填
        return PM_EPriceType.自定义单价 === type && price === '';
      };
      const flag =
        !projectDetail.value.priceAdjustmentType ||
        !projectDetail.value.priceAdjustmentType?.length ||
        projectDetail.value.priceAdjustmentType?.some((item) => {
          // 没有勾选调整方式或者，区间类型下没有填区间，或者非无限风险时配置项未填
          return (
            item.adjustType === null ||
            ([
              PM_EPriceAdjustmentType['浮动区间内不调，超出区间外的部分调整'],
              PM_EPriceAdjustmentType['浮动区间内不调，超出合同单价全调'],
            ].includes(+item.adjustType) &&
              (item.lower === '' || item.upper === '')) ||
            (item.adjustType !== PM_EPriceAdjustmentType.无限风险 &&
              (item.adjustTimeType === null ||
                item.priceType === null ||
                countFlag(item.priceType as PM_EPriceType, item.customPrice) ||
                item.adjustCardinalityType === null))
          );
        });
      console.log(projectDetail.value.priceAdjustmentType, flag);
      if (flag) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    const contractRules: Common_IObject = {
      trusteeshipType: [
        {
          required: true,
          trigger: 'change',
          message: ' ',
        },
      ],
      riskRating: [
        {
          required: true,
          trigger: 'change',
          message: ' ',
        },
      ],
      benchmarkType: [
        {
          required: true,
          trigger: 'change',
          validator: validateBenchmarkType,
        },
      ],
      shareModel: [
        {
          required: true,
          trigger: 'change',
          validator: validateShareModel,
        },
      ],
      // 2023-12-13----单价调差方式必填移除
      // priceAdjustmentType: [
      //   {
      //     required: true,
      //     trigger: 'change',
      //     validator: validatePriceAdjust,
      //   },
      // ],
    };
    // 自定义校验所属地区
    const validateDepositAreas = (rule: any, value: any, callback: any) => {
      const errorFlag = value?.some((item: any) => {
        if (item.isSubregion) {
          return item.price.some((pItem: any) => {
            return !pItem.areaName || !pItem.priceType || (pItem.priceType !== '2' && !pItem.value);
          });
        } else {
          return !item.price?.[0]?.priceType || (item.price?.[0]?.priceType !== '2' && !item.price?.[0]?.value);
        }
      });
      if (!value || value?.length === 0 || errorFlag) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };
    const hostingRules: Common_IObject = {
      depositAreas: [
        {
          required: true,
          trigger: 'blur',
          validator: validateDepositAreas,
        },
      ],
    };
    // 返回
    const onBack = () => {
      router.back();
    };
    /**
     * 修改托管期
     */
    const handleTrustSheepDateChange = () => {
      clearFormValidate('baseForm', 'trusteeshipDate');
      store.dispatch(
        'setHostingPeriodList',
        mapPeriodListByScope(projectDetail.value.trusteeshipDate as Date[], projectDetail.value.firstBatch),
      );

      if (incomeCalculationRef.value) {
        incomeCalculationRef.value?.updatePeriodList(
          projectDetail.value.trusteeshipDate as Date[],
          projectDetail.value.firstBatch,
        );
      }
    };
    // 能源类型change
    const onEnergyCodeChange = (value: string[]) => {
      const v: string[] = [];
      // 能源类型变更之后，需要同步修改code-name枚举，code-unit枚举
      energyCodeNameMap.value = new Map();
      energyCodeUnitMap.value = new Map();

      energyCodeList.value.forEach((item) => {
        energyCodeNameMap.value.set(item.code, item.name);
        energyCodeUnitMap.value.set(item.code, item.unit);

        if (value.includes(item.code)) {
          v.push(item.code);
        }
      });
      const energyTypeFilter = energyCodeList.value.filter((item) => {
        return value.includes(item.code);
      });

      clearFormValidate('baseForm', 'energyCode');
      clearFormValidate('baseForm', 'energyPriceList');
      /**
       * 处理节能项目
       */
      projectDetail.value.energyProjects.forEach((item) => {
        if (value?.length === 0 || !value.includes(item.energyCode)) {
          item.energyCode = '';
          item.treeId = [];
          item.treeId = [];
          item.treeList = [];
          item.expandedKeys = [];
        }
      });
      const oldData = projectDetail.value.depositAreas;
      projectDetail.value.depositAreas = [];
      energyTypeFilter.forEach((item) => {
        const existItem = oldData.find((ele) => {
          return ele.energyCode === item.code;
        });
        if (existItem) {
          projectDetail.value.depositAreas.push({
            name: existItem.name,
            energyCode: existItem.energyCode,
            isSubregion: existItem.isSubregion,
            price: existItem.price,
          });
        } else {
          projectDetail.value.depositAreas.push({
            name: item.name,
            energyCode: item.code,
            isSubregion: false,
            price: [
              {
                id: null,
                areaName: '',
                priceType: '',
                value: '',
              },
            ],
          });
        }
      });
      if (v?.length !== 0) {
        const list: EnergyCodePrice[] = [];
        v.forEach((item) => {
          const d = projectDetail.value?.energyPriceList?.filter((childItem) => {
            return item === childItem.energyCode;
          });
          if (d?.length) {
            const { energyCode, energyName, price, unit } = d[0];
            list.push({ energyCode, energyName, price, unit });
          } else {
            const d = energyCodeList.value?.filter((childItem) => {
              return item === childItem.code;
            });
            const { code, name, unit } = d[0];
            list.push({
              energyCode: code,
              energyName: name,
              price: '',
              unit,
            });
          }
        });
        projectDetail.value.energyPriceList = list;
      } else {
        projectDetail.value.energyPriceList = [];
      }
    };
    // 切换基准类型
    const onBenchmarkingTypeChange = () => {
      projectDetail.value.increaseRate = '';
      clearFormValidate('contractForm', 'benchmarkType');
    };
    /**
     * 新增项目编码
     */
    const onProjectCodeAdd = () => {
      if (projectDetail.value?.projectNumber?.length < 10) {
        projectDetail.value?.projectNumber?.push('');
      }
    };
    // 删除项目编码
    const onProjectCodeDelete = (index: number) => {
      projectDetail.value.projectNumber.splice(index, 1);
    };
    // 新增托管区域
    const addNewArea = (areas: any[]) => {
      if (areas?.length === 10) {
        message.error('托管区域不能超过10个！');
        return;
      }
      areas.push({
        id: `custom-${randomNumber32()}`,
        areaName: '',
        priceType: '',
        value: '',
      });
    };
    // 删除托管区域
    const areaDelete = (areas: any[], index: number, energyCode: string, id: string) => {
      areas.splice(index, 1);
      projectDetail.value.energyProjects?.forEach((item) => {
        if (item.energyCode === energyCode) {
          item.regionId = item.regionId + '' === id + '' ? '' : item.regionId;
          item.energyAreaList = mapTrustAreaList(energyCode);
        }
      });
    };
    // 区域名称填写
    const handleAreaNameChange = (index: number, energyCode: string) => {
      projectDetail.value.energyProjects?.forEach((item) => {
        if (item.energyCode === energyCode) {
          item.energyAreaList = mapTrustAreaList(energyCode);
          item.regionId = item.energyAreaList?.some((it) => it.code === item.regionId) ? item.regionId : '';
        }
      });
      clearFormValidate('hostingForm', 'depositAreas');
    };
    // 保存
    const onSave = async () => {
      baseForm.value?.clearValidate();
      contractForm.value?.clearValidate();
      hostingForm.value?.clearValidate();

      if (!getFormValidate() || editorLoading.value) {
        return;
      }
      try {
        // 如果从未编辑过，就不需要判断改变项
        if (neverEditor.value) {
          // 2023-11-15-验收时间&建设期收入只有财务能填并且可以更改，所以不用提示了
          getSaveRequest();
        } else {
          confirmChanges();
        }
      } catch (error) {
        console.warn('------------error-onSave--------------', error);
      }
    };
    /**
     * 校验是否有校验项更改
     */
    const confirmChanges = () => {
      const params = getEditorParams();
      const changeTypes = checkValueChangeOrNot(params);
      // 从未编辑过的才校验字段变化
      if (changeTypes?.length) {
        ElMessageBox.confirm(`【${changeTypes.join('、')}】发生变更，对应数据将被修改，请确认是否修改！`, '保存提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            getSaveRequest();
          })
          .catch(() => {
            console.warn('取消保存确认');
          });
      } else {
        getSaveRequest();
      }
    };
    // 保存请求
    const getSaveRequest = async () => {
      try {
        const params = getEditorParams();
        console.log('%c✨✨params✨✨', 'font-size: 24px', params);
        editorLoading.value = true;
        const res = await projectManageService.getProjectEditor(params);
        if (res && res.code === 200 && res.data) {
          message.success('保存成功');
          isError.value = false;
          queryEnergyList();
          getProjectDetail();
        } else {
          console.warn('保存失败！--------------------------------', res);
          message.error(res.message || '保存失败');
        }
      } catch (error) {
        console.warn('保存失败！--------------------------------', error, (error as any).data?.errmsg);
        message.error(`保存失败，${(error as any).data?.errmsg || ''}`);
      } finally {
        editorLoading.value = false;
      }
    };
    /**
     * 获取项目编辑数据
     * @returns {SearchDetailVO}
     */
    const getEditorParams = (): SearchDetailVO => {
      const contractInfoVO: ContractInfoVO = getContractVO();
      const hostingDetailVO: HostingDetailVO = getTrustVO();
      const projectBasicInfoVO: ProjectBasicInfoVO = getBasicProjectVO();

      return {
        projectBasicInfoVO,
        contractInfoVO,
        hostingDetailVO,
        ...getTenant(),
      };
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
        isError.value = true;
        provinceList.value = [];
      }
    };
    // 获取市列表
    const queryCityList = async () => {
      try {
        const res = await projectManageService.getCityListByProvinceCode(projectDetail.value.province);
        if (res && res.code === 200 && res.data) {
          cityList.value = res.data;
        } else {
          cityList.value = [];
        }
      } catch (error) {
        cityList.value = [];
        loading.value = false;
        console.warn('市列表----------------->', error);
      }
    };
    // 获取区县列表
    const queryDistrictList = async () => {
      try {
        const res = await projectManageService.getCountyListByCityCode(projectDetail.value.city);
        if (res && res.code === 200 && res.data) {
          districtList.value = res.data;
        } else {
          districtList.value = [];
        }
      } catch (error) {
        districtList.value = [];
        loading.value = false;
        console.warn('区县列表----------------->', error);
      }
    };
    // 查询
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
        loading.value = false;
        console.warn('大区列表----------------->', error);
      }
    };
    // 获取基础信息
    const getBasicProjectVO = (): ProjectBasicInfoVO => {
      const {
        projectNumber,
        status,
        province,
        city,
        region,
        district,
        energyManager,
        operationalPeriod,
        trusteeshipDate,
        firstBatch,
        buildingIncome,
        energyPriceList,
        hasPartnerShare,
        acceptanceTime,
        bindingHospitalId,
        bindingAreaIds,
      } = projectDetail.value;
      return {
        projectNumber: projectNumber ?? [''],
        province,
        city,
        district,
        region,
        startTime:
          operationalPeriod?.length && operationalPeriod[0]
            ? dayjs(operationalPeriod[0].getTime()).format('YYYY-MM-DD')
            : '',
        endTime:
          operationalPeriod?.length && operationalPeriod?.[1]
            ? dayjs(operationalPeriod[1].getTime()).format('YYYY-MM-DD')
            : '',
        firstBatch,
        buildingIncome,
        hostingStartTime:
          trusteeshipDate?.length && trusteeshipDate[0] ? dayjs(trusteeshipDate[0].getTime()).format('YYYY-MM-DD') : '',
        hostingEndTime:
          trusteeshipDate?.length && trusteeshipDate?.[1]
            ? dayjs(trusteeshipDate[1].getTime()).format('YYYY-MM-DD')
            : '',
        energyManager,
        status,
        energyPriceInfoList: energyPriceList,
        acceptanceTime: acceptanceTime ? dayjs(new Date(acceptanceTime).getTime()).format('YYYY-MM-DD') : '',
        bindingHospitalId: bindingHospitalId,
        bindingAreaIds: bindingAreaIds ?? [],
      };
    };
    // 获取合同信息
    const getContractVO = (): ContractInfoVO => {
      const {
        trusteeshipType,
        riskRating,
        benchmarkType,
        shareModel,
        priceAdjustmentType,
        nodePeriod,
        feeNodeType,
        increaseRate,
      } = projectDetail.value;
      let pAdjustType = priceAdjustmentType?.map((item) => ({
        energyCode: item.energyCode,
        adjustType: item.adjustType,
        lower:
          item.adjustType !== null &&
          [PM_EPriceAdjustmentType.变动实时调整, PM_EPriceAdjustmentType.无限风险].includes(item.adjustType)
            ? ''
            : item.lower,
        upper:
          item.adjustType !== null &&
          [PM_EPriceAdjustmentType.变动实时调整, PM_EPriceAdjustmentType.无限风险].includes(item.adjustType)
            ? ''
            : item.upper,
        adjustTimeType: item.adjustTimeType,
        priceType: item.priceType,
        customPrice: item.priceType !== null && +item.priceType === PM_EPriceType.自定义单价 ? item.customPrice : '',
        decimalPoint: item.priceType !== null && +item.priceType !== PM_EPriceType.自定义单价 ? item.decimalPoint : '',
        adjustCardinalityType: item.adjustCardinalityType,
      }));
      //  如果调整方式没有填写
      // if (!mapUserIsFinancialExperts()) {
      pAdjustType = pAdjustType.filter((item) => item.adjustType);
      // }
      return {
        benchmarkType,
        growthRate: increaseRate !== '' ? String(floatDivide(Number(increaseRate), 100)) : '',
        shareModel,
        priceAdjustmentType: pAdjustType,
        nodePeriod: nodePeriod
          ?.map((item) => ({
            nodeDivision: item?.nodeDivision,
            nodeId: item?.nodeId,
            periodType: item?.nodeId === null ? null : item?.periodType,
            periodStr:
              item?.nodeId !== null && item.periodType !== null && +item.periodType === PM_EProjectPeriodType.自定义
                ? item?.periodStr?.join(',')
                : '',
          }))
          ?.filter((item) => !!item.nodeId),
        feeNodeType: feeNodeType ?? [],
        hostingType: trusteeshipType,
        riskRating,
      };
    };
    // 获取托管信息
    const getTrustVO = (transtion: boolean = true): HostingDetailVO => {
      const { energyProjects, depositAreas } = projectDetail.value;

      const checkedProjects = energyProjects?.filter((item) => {
        return item.checked;
      });
      return {
        energyConservationList: checkedProjects?.length
          ? checkedProjects?.map((item) => {
              let regionName = '';
              item.energyAreaList.forEach((childItem) => {
                if (item.regionId === childItem.code) {
                  regionName = childItem.name;
                }
              });
              return {
                projectCode: item.projectCode ?? '',
                projectName: item.projectName ?? '',
                energyCode: item.energyCode ?? '',
                treeId: item.treeId[0],
                treeType: item.treeType,
                regionId: item?.regionId?.includes('custom') ? null : item.regionId,
                regionName,
              };
            })
          : [],

        hostingAreaInfoList: depositAreas?.length
          ? depositAreas?.map((item) => {
              return {
                energyCode: item.energyCode,
                name: item.name,
                isSubregion: item.isSubregion,
                price: item.price?.map((item) => {
                  return {
                    ...item,
                    id: String(item?.id)?.includes('custom') ? null : item.id,
                  };
                }),
              };
            })
          : [],
      };
    };
    // 校验表单参数
    const getFormValidate = () => {
      console.log(' projectDetail.value-----------------------------------------', projectDetail.value);
      let flag = true;
      let baseFlag = true;
      let contractFlag = true;
      let hostingFlag = true;

      if (!baseForm.value) {
        return flag;
      }
      // 校验表单
      baseForm.value.validate((valid: boolean) => {
        baseFlag = valid;
        if (!valid) {
          console.warn('基本信息表单基本必填项为空！');
        }
      });
      try {
        contractForm.value.validate((valid: boolean) => {
          contractFlag = valid;
          if (!valid) {
            console.warn('合同信息表单基本必填项为空！');
          }
        });
      } catch (error) {
        console.log(error);
      }
      hostingForm.value.validate((valid: boolean) => {
        hostingFlag = valid;
        if (!valid) {
          console.warn('托管详情表单基本必填项为空！');
        }
      });
      if (!baseFlag || !contractFlag || !hostingFlag) {
        message.error('保存失败，请填写必填项！');
        return false;
      }
      // 项目编码
      if (projectDetail.value?.projectNumber?.length > 0) {
        const names = projectDetail.value?.projectNumber?.map((item) => {
          return item;
        });
        flag = Array.from(new Set(names))?.length === projectDetail.value?.projectNumber?.length;
      }
      if (!flag) {
        console.warn('项目编码不能重复！');
        message.error('保存失败，项目编码不能重复！');
        return flag;
      }
      // 项目收入---托管周期
      if (
        projectDetail.value.nodePeriod?.some(
          (item) =>
            item.periodType !== null &&
            +item.periodType === PM_EProjectPeriodType.自定义 &&
            item.periodStr?.length === 0,
        )
      ) {
        console.warn('项目收入计算-托管期不完整');
        message.error('保存失败，项目收入计算托管期不完整！');
        return false;
      }
      // 单价调差方式
      if (projectDetail.value.priceAdjustmentType?.some((item) => Number(item.upper) < Number(item.lower))) {
        console.warn('浮动区间大小关系错误');
        message.error('保存失败，浮动下限应小于或等于浮动上限！');
        return false;
      }
      // 核算涉及费用
      if (
        projectDetail.value.feeNodeType.some(
          (item) =>
            +item.feeType === PM_IFeeNodeType.院方部分缴费 && (item.energyCodes === '' || item.energyCodes === null),
        )
      ) {
        console.warn('院方部分缴费能源类型不完整！');
        message.error('保存失败，院方部分缴费能源类型不完整！');
        return false;
      }

      // 托管区域
      flag = projectDetail.value?.depositAreas?.some((item) => {
        if (item.isSubregion) {
          return item.price.some((item) => {
            return !item.areaName || !item.priceType || (item.priceType !== '2' && !item.value);
          });
        } else {
          return !item.price?.[0]?.priceType || (item.price?.[0]?.priceType !== '2' && !item.price?.[0]?.value);
        }
      });
      if (flag) {
        message.error('保存失败，托管区域内容不完整！');
        return !flag;
      }

      flag = projectDetail.value?.depositAreas?.some((item) => {
        if (item.isSubregion) {
          return item.price.length < 2;
        }
      });
      if (flag) {
        message.error('保存失败，托管区域至少需要2个！');
        return !flag;
      }
      // 节能项目
      flag = projectDetail.value?.energyProjects?.every((item) => {
        let isSubregion = false;
        projectDetail.value.depositAreas?.forEach((dItem) => {
          if (dItem.energyCode === item.energyCode && dItem.isSubregion) {
            isSubregion = true;
          }
        });
        return (
          (item.checked &&
            item.treeId?.length !== 0 &&
            item?.treeType !== null &&
            (!isSubregion || (isSubregion && !!item.regionId))) ||
          !item.checked
        );
      });
      if (!flag) {
        console.warn('节能项目填写不完整');
        message.error('保存失败，节能项目填写不完整！');
        return flag;
      }
      return flag;
    };
    /**
     * 校验 是否存在合作伙伴、单价调整方式、托管期、托管能源类型、合同单价、托管区域、节能项目是否发生改变
     * @param {SearchDetailVO} params
     * @returns string[]
     */
    const checkValueChangeOrNot = (params: SearchDetailVO): string[] => {
      const changeTypes = [];
      // 比较能源类型
      if (validateEnergyChangeOrNot()) {
        console.warn('能源类型发生改变');
        changeTypes.push('能源类型');
      }
      // 托管周期
      if (
        !(
          (originalValue?.projectBasicInfoVO?.hostingStartTime === '' &&
            !originalValue?.projectBasicInfoVO?.hostingEndTime &&
            !params.projectBasicInfoVO.hostingEndTime &&
            !params.projectBasicInfoVO.hostingStartTime) ||
          (originalValue &&
            originalValue?.projectBasicInfoVO &&
            originalValue?.projectBasicInfoVO?.hostingStartTime &&
            originalValue?.projectBasicInfoVO.hostingEndTime &&
            params.projectBasicInfoVO.hostingEndTime &&
            params.projectBasicInfoVO.hostingStartTime &&
            formatDateStamp(new Date(originalValue?.projectBasicInfoVO?.hostingStartTime).getTime(), 'YYYY-MM-DD') ===
              params.projectBasicInfoVO.hostingStartTime &&
            formatDateStamp(new Date(originalValue?.projectBasicInfoVO?.hostingEndTime).getTime(), 'YYYY-MM-DD') ===
              params.projectBasicInfoVO.hostingEndTime)
        )
      ) {
        console.warn('托管周期发生改变');
        changeTypes.push('托管周期');
      }
      // 比较合同单价
      if (validateEnergyPriceChangeOrNot()) {
        console.warn('合同单价发生改变');
        changeTypes.push('合同单价');
      }
      // 比较收益分享模式
      if (checkShareModeChange(projectDetail.value.shareModel, originalValue.contractInfoVO.shareModel)) {
        console.warn('收益分享模式发生改变');
        changeTypes.push('收益分享模式');
      }
      // 比较单价调整方式
      if (
        checkPriceAdjustTypeChange(
          projectDetail.value.priceAdjustmentType,
          originalValue.contractInfoVO.priceAdjustmentType,
        )
      ) {
        console.warn('单价调整方式发生改变');
        changeTypes.push('单价调差方式');
      }
      // 比较托管区域
      if (validateTrustAreaChangeOrNot()) {
        console.warn('托管区域发生改变');
        changeTypes.push('托管区域');
      }
      // 比较节能项目
      if (validateProjectChangeOrNot()) {
        console.warn('节能项目发生改变');
        changeTypes.push('节能项目');
      }
      return changeTypes;
    };
    /**
     * 比较能源类型 单价是否变化
     * @returns  {boolean}
     */
    const validateEnergyChangeOrNot = (): boolean => {
      const params = getBasicProjectVO();
      return params.energyPriceInfoList?.length !== originalValue?.projectBasicInfoVO?.energyPriceInfoList?.length;
    };
    /**
     *  比较能源类型 单价是否变化
     * @returns
     */
    const validateEnergyPriceChangeOrNot = () => {
      const params = getBasicProjectVO();
      let flag = false;
      // 比较长度
      if (
        originalValue?.projectBasicInfoVO &&
        params.energyPriceInfoList?.length !== originalValue?.projectBasicInfoVO?.energyPriceInfoList?.length
      ) {
        flag = true;
        return flag;
      }
      // 长度一致
      if (params.energyPriceInfoList?.length !== 0) {
        flag = params.energyPriceInfoList.some((item, index) => {
          return (
            item.energyCode !== originalValue?.projectBasicInfoVO?.energyPriceInfoList[index].energyCode ||
            String(item.price) !== String(originalValue?.projectBasicInfoVO?.energyPriceInfoList[index].price)
          );
        });
      }
      return flag;
    };
    // 比较托管区域
    const validateTrustAreaChangeOrNot = () => {
      const params = getTrustVO(false);
      let flag = false;
      const hostingAreaInfoListClone = cloneDeep(params.hostingAreaInfoList);
      if (hostingAreaInfoListClone?.length !== originalValue?.hostingDetailVO?.hostingAreaInfoList?.length) {
        flag = true;
      } else if (hostingAreaInfoListClone?.length !== 0) {
        if (
          JSON.stringify(originalValue?.hostingDetailVO?.hostingAreaInfoList) !==
          JSON.stringify(hostingAreaInfoListClone)
        ) {
          flag = true;
        }
      }
      return flag;
    };
    // 比较节能项目
    const validateProjectChangeOrNot = () => {
      const params = getTrustVO();
      let flag = false;
      if (params.energyConservationList?.length !== originalValue?.hostingDetailVO?.energyConservationList?.length) {
        flag = true;
        return flag;
      }
      if (params.energyConservationList?.length !== 0) {
        params.energyConservationList.forEach((item, index) => {
          if (
            item.treeId !== originalValue?.hostingDetailVO?.energyConservationList[index].treeId ||
            item.energyCode !== originalValue?.hostingDetailVO?.energyConservationList[index].energyCode
          ) {
            flag = true;
          }
        });
      }
      return flag;
    };
    // 查询详情
    const getProjectDetail = async () => {
      try {
        loading.value = true;
        const res: HttpRequestModule.ResTemplate<SearchDetailVO> =
          await projectManageService.queryProjectDetailByCodeAndId<SearchDetailVO>({
            ...getTenant(),
          });
        if (res && res.code === 200 && res.data) {
          // 基础信息
          convertProjectBasicDetail(res?.data?.projectBasicInfoVO);
          // 合同信息
          convertContractDetail(res?.data?.contractInfoVO);
          // 托管详情
          convertHostingDetail(res?.data?.hostingDetailVO);
          // 处理原始数据
          converterOldValue(res.data);
          console.log('%c✨✨加载项目信息✨✨', 'font-size: 24px', projectDetail.value);
        } else {
          console.log('%c✨✨加载项目信息Error✨✨', 'font-size: 24px', projectDetail.value, res);
          // 基础信息
          convertProjectBasicDetail();
          // 合同信息
          convertContractDetail();
          // 托管详情
          convertHostingDetail();
        }
      } catch (error) {
        console.log('%c✨✨加载项目信息Error✨✨', 'font-size: 24px', error);
        // 基础信息
        convertProjectBasicDetail();
        // 合同信息
        convertContractDetail();
        // 托管详情
        convertHostingDetail();
        isError.value = true;
      } finally {
        loading.value = false;
        nextTick(() => {
          if (baseForm.value) {
            baseForm.value?.clearValidate();
          }
        });
      }
    };
    /**
     * 回显基础信息
     * @param data
     */
    const convertProjectBasicDetail = (data?: ProjectBasicInfoVO) => {
      // 判断基础信息是否为null, 如果是则代表从未编辑过
      neverEditor.value = Object.prototype.toString.call(data) === '[object Null]';
      console.warn('是否从未编辑过-------------', neverEditor.value);

      projectDetail.value.projectNumber = data?.projectNumber?.length ? data?.projectNumber : [''];
      projectDetail.value.status = data?.status ?? '';
      projectDetail.value.projectName = data?.projectName
        ? data?.projectName
        : FGetStorageData('toc-project-name') ?? '';
      projectDetail.value.province = data?.province ?? '';
      projectDetail.value.city = data?.city ?? '';
      projectDetail.value.district = data?.district ?? '';
      projectDetail.value.region = data?.region ?? '';
      projectDetail.value.energyManager = data?.energyManager ?? '';
      projectDetail.value.operationalPeriod =
        data?.startTime && data?.endTime ? [new Date(data?.startTime), new Date(data?.endTime)] : [];
      // 托管周期
      projectDetail.value.trusteeshipDate =
        data?.hostingStartTime && data?.hostingEndTime
          ? [new Date(data?.hostingStartTime), new Date(data?.hostingEndTime)]
          : [];
      projectDetail.value.firstBatch = !!data && !!data?.firstBatch ? data?.firstBatch : '12';
      // 生成托管周期列表
      store.dispatch(
        'setHostingPeriodList',
        mapPeriodListByScope(projectDetail.value.trusteeshipDate as Date[], projectDetail.value.firstBatch),
      );
      store.dispatch('setTrustSheepDateList', projectDetail.value.trusteeshipDate ?? []);

      projectDetail.value.acceptanceTime = data?.acceptanceTime
        ? dayjs(new Date(data?.acceptanceTime).getTime()).format('YYYY-MM-DD')
        : '';
      projectDetail.value.energyCode = data?.energyPriceInfoList?.length
        ? data?.energyPriceInfoList?.map((item) => {
            return item.energyCode;
          })
        : [];
      projectDetail.value.buildingIncome = data?.buildingIncome ?? '';

      projectDetail.value.energyPriceList = data?.energyPriceInfoList ?? [];
      projectDetail.value.bindingHospitalId = data?.bindingHospitalId ?? '';
      projectDetail.value.bindingAreaIds = data?.bindingAreaIds ?? [];

      if (projectDetail.value.bindingHospitalId) {
        hospitalIdArea.value = areaMap?.[projectDetail.value.bindingHospitalId] ?? [];
      }
    };
    /**
     * 回显项目合同信息
     */
    const convertContractDetail = (data?: ContractInfoVO) => {
      projectDetail.value.trusteeshipType = data?.hostingType ?? '';
      projectDetail.value.riskRating = data?.riskRating ?? '';
      projectDetail.value.benchmarkType = data?.benchmarkType ?? '';
      projectDetail.value.increaseRate =
        (data?.growthRate ?? '--') !== '--' ? String(transferPercent(Number(data?.growthRate), 100)) : '';
      // 收益分享模式-默认选中保证伙伴收益型
      projectDetail.value.shareModel =
        Array.isArray(data?.shareModel) && data?.shareModel?.length !== 0
          ? data?.shareModel?.map((item) => {
              return {
                incomeShareModel: item?.incomeShareModel !== null ? +item?.incomeShareModel : null,
                incomeShareObject: item?.incomeShareObject !== null ? +item?.incomeShareObject : null,
                incomeShareType: item?.incomeShareType !== null ? +item?.incomeShareType : null,
                remark: item?.remark,
              };
            }) ?? []
          : [
              {
                incomeShareModel: PM_EGrainSharingMode.保证伙伴收益型,
                incomeShareObject: null,
                incomeShareType: null,
                remark: '',
              },
            ];
      // 项目收入计算
      // 核算
      const account = data?.nodePeriod?.find(
        (item) => item?.nodeDivision && +item?.nodeDivision === PM_EProjectIncomeType.项目核算表,
      ) as any;
      // 预算
      const budget = data?.nodePeriod?.find(
        (item) => item?.nodeDivision && +item?.nodeDivision === PM_EProjectIncomeType.项目预算表,
      ) as any;
      projectDetail.value.nodePeriod = [
        {
          nodeId: data === null ? PM_TIANSU_NODE_ID : !!budget && budget?.nodeId ? budget?.nodeId : null,
          nodeDivision: PM_EProjectIncomeType.项目预算表,
          periodType:
            data === null ? PM_EProjectPeriodType.全周期 : !!budget && budget?.periodType ? +budget?.periodType : null,
          periodStr:
            !!budget && budget.periodStr
              ? budget?.periodStr
                  ?.split(',')
                  ?.filter((item: string) => item !== '' && item !== '0')
                  ?.map((item: string) => Number(item)) ?? []
              : [],
        },
        {
          nodeId: data === null ? PM_TIANSU_NODE_ID : !!account && account?.nodeId ? account?.nodeId : null,
          nodeDivision: PM_EProjectIncomeType.项目核算表,
          periodType:
            data === null
              ? PM_EProjectPeriodType.全周期
              : !!account && account?.periodType
              ? +account?.periodType
              : null,
          periodStr:
            !!account && account.periodStr
              ? account?.periodStr
                  ?.split(',')
                  ?.filter((item: string) => item !== '' && item !== '0')
                  ?.map((item: string) => Number(item)) ?? []
              : [],
        },
      ];
      // 单价调差方式
      projectDetail.value.priceAdjustmentType = [];
      projectDetail.value.energyCode.forEach((item) => {
        // 先根据配置的能源类型找到对应单价调整方式单项
        const priceIndex = data?.priceAdjustmentType?.findIndex((cItem) => cItem.energyCode === item) ?? -1;
        const priceItem = priceIndex !== -1 ? data?.priceAdjustmentType?.[priceIndex] : null;
        let priceType =
          priceItem !== undefined && priceItem !== null && priceItem.priceType !== null ? +priceItem?.priceType : null;
        // 历史数据中有调差方式为浮动区间内不调，超出区间外的部分调整、浮动区间内不调且单价类型为实际单价的，进行特殊处理
        if (
          priceItem?.adjustType !== null &&
          priceItem?.adjustType !== undefined &&
          [
            PM_EPriceAdjustmentType['浮动区间内不调，超出合同单价全调'],
            PM_EPriceAdjustmentType['浮动区间内不调，超出区间外的部分调整'],
          ].includes(+priceItem?.adjustType) &&
          priceType !== null &&
          priceType === PM_EPriceType.当月实际单价
        ) {
          priceType = null;
        }
        projectDetail.value?.priceAdjustmentType?.push({
          energyCode: item,
          adjustType: priceItem && priceItem?.adjustType !== null ? +priceItem?.adjustType : null,
          lower:
            priceItem &&
            priceItem.adjustType !== null &&
            [PM_EPriceAdjustmentType.变动实时调整, PM_EPriceAdjustmentType.无限风险].includes(priceItem.adjustType)
              ? ''
              : priceItem?.lower ?? '',
          upper:
            priceItem &&
            priceItem.adjustType !== null &&
            [PM_EPriceAdjustmentType.变动实时调整, PM_EPriceAdjustmentType.无限风险].includes(priceItem.adjustType)
              ? ''
              : priceItem?.upper ?? '',
          adjustTimeType: priceItem && priceItem?.adjustTimeType !== null ? +priceItem?.adjustTimeType : null,
          priceType,
          customPrice:
            priceItem &&
            priceItem.priceType !== null &&
            Number(priceItem.priceType) === PM_EPriceType.自定义单价 &&
            priceItem?.customPrice !== '' &&
            priceItem?.customPrice !== null
              ? priceItem.customPrice + ''
              : '',
          decimalPoint:
            priceItem &&
            priceItem.priceType !== null &&
            Number(priceItem.priceType) !== PM_EPriceType.自定义单价 &&
            priceItem?.decimalPoint !== '' &&
            priceItem?.decimalPoint !== null
              ? priceItem.decimalPoint + ''
              : '',
          adjustCardinalityType:
            priceItem && priceItem?.adjustCardinalityType !== null ? +priceItem?.adjustCardinalityType : null,
        });
      });
      // 核算涉及费用
      projectDetail.value.feeNodeType = data?.feeNodeType ?? [];
    };
    /**
     * 回显托管项目信息
     * @param data
     */
    const convertHostingDetail = (data?: HostingDetailVO) => {
      projectDetail.value.depositAreas = data?.hostingAreaInfoList?.length
        ? data?.hostingAreaInfoList?.map((item) => {
            return {
              energyCode: item.energyCode,
              name: item.name,
              isSubregion: item.isSubregion,
              price: item.price,
            };
          })
        : [];
      handleEnergyCodeProject(data?.energyConservationList ?? []);
    };
    /**
     * 处理初始数据
     * @param data
     */
    const converterOldValue = (data: SearchDetailVO) => {
      // 项目编码
      originalValue.projectBasicInfoVO.projectNumber =
        data?.projectBasicInfoVO?.projectNumber && data?.projectBasicInfoVO?.projectNumber?.length
          ? cloneDeep(data?.projectBasicInfoVO?.projectNumber)
          : [''];
      originalValue.projectBasicInfoVO.status = cloneDeep(data?.projectBasicInfoVO?.status) ?? '';
      originalValue.projectBasicInfoVO.province = cloneDeep(data?.projectBasicInfoVO?.province) ?? '';
      originalValue.projectBasicInfoVO.city = cloneDeep(data?.projectBasicInfoVO?.city) ?? '';
      originalValue.projectBasicInfoVO.district = cloneDeep(data?.projectBasicInfoVO?.district) ?? '';
      originalValue.projectBasicInfoVO.startTime = cloneDeep(data?.projectBasicInfoVO?.startTime) ?? '';
      originalValue.projectBasicInfoVO.endTime = cloneDeep(data?.projectBasicInfoVO?.endTime) ?? '';
      originalValue.projectBasicInfoVO.hostingStartTime = cloneDeep(data?.projectBasicInfoVO?.hostingStartTime) ?? '';
      originalValue.projectBasicInfoVO.hostingEndTime = cloneDeep(data?.projectBasicInfoVO?.hostingEndTime) ?? '';
      // 验收时间
      originalValue.projectBasicInfoVO.acceptanceTime = cloneDeep(data?.projectBasicInfoVO?.acceptanceTime) ?? '';
      originalValue.projectBasicInfoVO.energyManager = cloneDeep(data?.projectBasicInfoVO?.energyManager) ?? '';
      originalValue.projectBasicInfoVO.energyPriceInfoList =
        cloneDeep(data?.projectBasicInfoVO?.energyPriceInfoList) ?? [];

      originalValue.contractInfoVO.hostingType = cloneDeep(data?.contractInfoVO?.hostingType) ?? '';
      originalValue.contractInfoVO.riskRating = cloneDeep(data?.contractInfoVO?.riskRating) ?? '';
      originalValue.contractInfoVO.benchmarkType = cloneDeep(data?.contractInfoVO?.benchmarkType) ?? '';
      originalValue.contractInfoVO.growthRate = cloneDeep(data?.contractInfoVO?.growthRate) ?? '';
      // 收益分享模式
      originalValue.contractInfoVO.shareModel = cloneDeep(projectDetail.value?.shareModel);
      // 单价调差方式
      originalValue.contractInfoVO.priceAdjustmentType = cloneDeep(projectDetail.value?.priceAdjustmentType) ?? '';
      originalValue.hostingDetailVO.energyConservationList =
        cloneDeep(data?.hostingDetailVO?.energyConservationList) ?? [];
      originalValue.hostingDetailVO.hostingAreaInfoList = cloneDeep(data?.hostingDetailVO?.hostingAreaInfoList) ?? [];
    };
    // 回显节能项目
    const handleEnergyCodeProject = (energyConservationList: SearchEnergyProject[]) => {
      if (!energyConservationList || energyConservationList?.length === 0) {
        return;
      }
      const treeMap = new Map();
      const codes = energyConservationList?.map((item) => {
        return item.projectCode;
      });
      projectDetail.value.energyProjects.forEach(async (parentItem, parentIndex) => {
        if (codes.includes(parentItem.projectCode)) {
          const item = energyConservationList?.filter((item) => {
            return item.projectCode === parentItem.projectCode;
          })[0];
          let treeList = [];
          let expandedKeys = [];
          if (treeMap.size === 0 || treeMap.get(`${item.treeType}-${item.energyCode}`)?.data?.length === 0) {
            const d = await getTreeList(item.energyCode, item.treeType || treeTypeList[0].value);
            treeMap.set(`${item.treeType}-${item.energyCode}`, d);
          }
          treeList = treeMap.get(`${item.treeType}-${item.energyCode}`).data;
          expandedKeys = treeMap.get(`${item.treeType}-${item.energyCode}`).expandTreeIds;
          projectDetail.value.energyProjects[parentIndex] = {
            checked: true,
            projectCode: item.projectCode ?? '',
            projectName: item.projectName ?? '',
            treeId: item.treeId ? [item.treeId] : [],
            energyCode: item.energyCode ?? '',
            treeType: item?.treeType,
            treeList,
            expandedKeys,
            loading: false,
            regionId: item.regionId ? item.regionId + '' : '',
            regionName: item.regionName,
            energyAreaList: mapTrustAreaList(item.energyCode),
          };
        }
      });
    };
    // 拼接托管区域
    const mapTrustAreaList = (energyCode: string) => {
      let list: CommonICodeName<string>[] = [];
      projectDetail.value.depositAreas?.forEach((item) => {
        if (item.energyCode === energyCode && item.isSubregion) {
          list = item.price
            ?.map((childItem) => {
              return {
                code: childItem.id + '',
                name: childItem.areaName,
              };
            })
            ?.filter((it) => it.name !== '' && it.name !== null);
        }
      });
      return list;
    };
    // 省change
    const onProvinceChange = (value: string) => {
      projectDetail.value.province = value;
      projectDetail.value.city = '';
      clearFormValidate('baseForm', 'province');
      queryCityList();
    };
    // 市change
    const onCityChange = (value: string) => {
      projectDetail.value.city = value;
      projectDetail.value.district = '';
      clearFormValidate('baseForm', 'province');
      queryDistrictList();
    };
    // 选中项目切换
    const onProjectCheckChange = (index: number) => {
      if (!projectDetail.value.energyProjects[index].checked) {
        projectDetail.value.energyProjects[index].treeType = treeTypeList[0].value;
        projectDetail.value.energyProjects[index].energyCode = '';
        projectDetail.value.energyProjects[index].treeId = [];
        projectDetail.value.energyProjects[index].treeList = [];
        projectDetail.value.energyProjects[index].expandedKeys = [];
        projectDetail.value.energyProjects[index].regionId = '';
        projectDetail.value.energyProjects[index].energyAreaList = [];
      }
    };
    /**
     * 能源类型是否禁用 查看状态或者非选中状态
     * @param checked 是否被选中
     * @returns
     */
    const checkDisabled = (checked: boolean) => {
      return !checked;
    };
    // 节能项目能源类型change
    const onProjectEnergyCodeChange = async (index: number) => {
      projectDetail.value.energyProjects[index].treeType = treeTypeList[0].value;
      onTreeTypeEnergyCodeChange(index);

      const { energyCode } = projectDetail.value.energyProjects[index];
      const list = mapTrustAreaList(energyCode);
      projectDetail.value.energyProjects[index].energyAreaList = list;
      projectDetail.value.energyProjects[index].regionId = '';
    };
    // 切换树类型
    const onTreeTypeEnergyCodeChange = async (index: number) => {
      try {
        projectDetail.value.energyProjects[index].loading = true;
        const { treeType, energyCode } = projectDetail.value.energyProjects[index];
        projectDetail.value.energyProjects[index].treeId = [];
        const d = await getTreeList(energyCode, treeType);
        projectDetail.value.energyProjects[index].treeList = d.data;
        projectDetail.value.energyProjects[index].expandedKeys = d.expandTreeIds;
        projectDetail.value.energyProjects[index].loading = false;
      } catch (error) {
        projectDetail.value.energyProjects[index].loading = false;
      }
    };
    /**
     * 当前能源类型是否分区托管
     * @param energyCode
     * @returns
     */
    const mapTrustAreaSelectShow = (energyCode: string) => {
      return projectDetail.value.depositAreas?.some((item) => {
        return item.energyCode === energyCode && item.isSubregion;
      });
    };
    // 查询树列表
    const getTreeList = (energyCode: string, treeType: string): Promise<TreeRes> => {
      return new Promise(async (resolve) => {
        if (!energyCode) {
          return resolve({
            data: [],
            expandTreeIds: [],
          });
        }
        const params: SearchTreeParams = {
          expandLevel: 2,
          treeType,
          energyCode,
          ...getTenant(),
        };
        try {
          const res = await projectManageService.queryTreeByEnergyCode(params);
          if (res && res.code === 200 && res.data) {
            resolve(res.data);
          } else {
            resolve({
              data: [],
              expandTreeIds: [],
            });
          }
        } catch (error) {
          resolve({
            data: [],
            expandTreeIds: [],
          });
        }
      });
    };
    // 清除表单校验
    const clearFormValidate = (type: string, prop: string) => {
      if (type === 'baseForm') {
        baseForm.value?.clearValidate(prop);
        if (prop === 'city') {
          baseForm.value?.clearValidate('province');
        }
        if (prop == 'district') {
          baseForm.value?.clearValidate('city');
        }
      } else if (type === 'contractForm') {
        contractForm.value?.clearValidate(prop);
      } else if (type === 'hostingForm') {
        hostingForm.value?.clearValidate(prop);
      }
    };

    const hospitals = ref<{ hospitalId: string; hospitalName: string; multiAreaFlag: boolean }[]>([]);
    let areaMap: { [key in string]: any } = {};
    const hospitalIdArea = ref([]);
    /**
     * 查询绑定项目
     */
    async function getBindProject() {
      try {
        const res = await projectManageService.getBindProject({
          ...getTenant(),
        });
        if (res && res.code === 200 && res.data) {
          hospitals.value = res.data.hospitals;
          areaMap = cloneDeep(res.data.hospitalIdAreaVOMap);
        } else {
          hospitals.value = [];
        }
      } catch (error) {
        loading.value = false;
      }
    }
    /**
     * 切换绑定项目
     * @param value 绑定项目
     */
    function hospitalChange(value: string) {
      projectDetail.value.bindingAreaIds = [];
      hospitalIdArea.value = areaMap?.[value] ?? [];
    }
    /**
     * 校验单选项是否发生改变
     */
    const validateOtherParamsChangeOrNot = () => {
      const changeItems: string[] = [];
      // 状态
      if (originalValue?.projectBasicInfoVO?.status !== projectDetail.value.status) {
        console.warn('warn----------------------- 状态 =======> change');
        changeItems.push('status');
      }
      // 区县
      if (originalValue?.projectBasicInfoVO?.district !== projectDetail.value.district) {
        console.warn('warn----------------------- 区县 =======> change');
        changeItems.push('district');
      }
      // 市
      if (originalValue?.projectBasicInfoVO?.city !== projectDetail.value.city) {
        console.warn('warn----------------------- 市 =======> change');
        changeItems.push('city');
      }
      // 省
      if (originalValue?.projectBasicInfoVO?.province !== projectDetail.value.province) {
        changeItems.push('province');
        console.warn('warn----------------------- 省 =======> change');
      }
      // 能源经理
      if (originalValue?.projectBasicInfoVO?.energyManager !== projectDetail.value.energyManager) {
        console.warn('warn----------------------- 能源经理 =======> change');
        changeItems.push('energyManager');
      }
      // 托管类型
      if (originalValue?.contractInfoVO?.hostingType !== projectDetail.value.trusteeshipType) {
        console.warn('warn----------------------- 托管类型 =======> change');
        changeItems.push('trusteeshipType');
      }
      // 项目风险评级
      if (originalValue?.contractInfoVO?.riskRating !== projectDetail.value.riskRating) {
        console.warn('warn----------------------- 项目风险评级 =======> change');
        changeItems.push('riskRating');
      }
      // 基准类型
      if (originalValue?.contractInfoVO?.benchmarkType !== projectDetail.value.benchmarkType) {
        console.warn('warn----------------------- 基准类型 =======> change');
        changeItems.push('benchmarkType');
      }
      // 基准类型不变 增长率改变
      if (
        projectDetail.value.benchmarkType &&
        projectDetail.value.benchmarkType === BenchmarkTypeEnum.INCREASE_TYPE &&
        originalValue?.contractInfoVO?.benchmarkType === projectDetail.value.benchmarkType &&
        originalValue.contractInfoVO.growthRate !== String(floatDivide(Number(projectDetail.value.increaseRate), 100))
      ) {
        console.warn('warn----------------------- 基准类型 增长率 =======> change');
        changeItems.push('increaseRate');
      }

      return changeItems;
    };
    /**
     * 路由跳转前
     */
    onBeforeRouteLeave((to, from, next) => {
      if (to.path === '/403' || to.path === '/404') {
        next();
        return;
      }
      const params = getEditorParams();
      const changes = [...validateOtherParamsChangeOrNot(), ...checkValueChangeOrNot(params)];

      if (changes?.length === 0) {
        next();
        return;
      }
      ElMessageBox.confirm('页面信息未保存，请确认是否离开！', '保存确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning',
      })
        .then((res) => {
          if (res === 'confirm') {
            next();
          }
        })
        .catch(() => {
          console.warn('未离开！');
        });
    });

    /**
     * 根据能源类型获取单位
     * @param energyCode
     * @returns
     */
    function mapEnergyUnit(energyCode: string) {
      let unit = '';
      energyCodeList.value.forEach((item) => {
        if (item.code === energyCode) {
          unit = item.unit;
        }
      });
      return unit;
    }

    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        isError.value = false;
        // 查询用户角色
        queryUserRole();

        projectDetail.value.energyProjects = [];
        projectDetail.value.energyProjects = projectTypeList.map((item) => {
          return {
            checked: false,
            projectCode: item.code,
            projectName: item.name,
            treeId: [],
            treeList: [],
            expandedKeys: [],
            treeType: treeTypeList[0].value,
            loading: false,
            energyCode: '',

            regionId: '',
            regionName: '',
            energyAreaList: [],
          };
        });
        getPriceType();
        getBindProject();
        queryRegionList();
        await queryProvinceList();
        if (isError.value) {
          loading.value = false;
          return;
        }
        await queryEnergyList();
        if (isError.value) {
          loading.value = false;
          return;
        }

        await getProjectDetail();
        if (projectDetail.value.province) {
          await queryCityList();
        }
        if (projectDetail.value.city) {
          await queryDistrictList();
        }
      } catch (error) {
        loading.value = false;
        isError.value = true;

        console.warn('init------------->', error);
      }
    });

    const priceSelectType = ref<any[]>([]);
    const priceTypeMap = {
      '1': '固定单价',
      '2': '实缴单价',
      '3': '首期合同单价',
      '4': '首期合同单价',
    };
    /**
     * 勾选分区托管
     * @param areas
     * @param value
     * @param energyCode
     */
    function onSubregionChange(areas: any, value: boolean, energyCode: string) {
      if (!value) {
        areas.price = [];
        areas.price.push({
          id: `custom-${randomNumber32()}`,
          areaName: '',
          priceType: '',
          value: '',
        });
        // 如果取消分区托管的是当前节能项目中勾选的能源类型时，需要重置区域信息
        projectDetail.value.energyProjects.forEach((item) => {
          if (item.energyCode === energyCode) {
            item.regionId = '';
            item.energyAreaList = [];
          }
        });
      } else {
        areas.price = areas?.price?.map((pItem: any) => {
          return {
            ...pItem,
            id: !!pItem?.areaName ? pItem?.id : `custom-${randomNumber32()}`,
            priceType: '',
            value: '',
          };
        });
        areas.price.push({
          id: `custom-${randomNumber32()}`,
          areaName: '',
          priceType: '',
          value: '',
        });
      }
    }
    /**
     * 校验是否为空
     */
    const checkIsEmpty = (value: string | number) => {
      return value === '' || value === null;
    };
    async function getPriceType() {
      try {
        const res = await projectManageService.getPriceType();
        if (res && res.code === 200 && res.data) {
          priceSelectType.value = res.data;
        } else {
          priceSelectType.value = [];
        }
      } catch (error) {
        priceSelectType.value = [];
        console.log(error);
      }
    }

    return {
      loading,
      isError,
      MAX_INPUT_LEN_40,
      MAX_INPUT_LEN_20,
      defaultTreeProps,
      projectStatusList,
      trusteeshipTypeList,
      riskRatingList,
      projectTypeList,
      standardTypeList,
      hasBackFlag,
      regionList,
      isIframeLoad,

      provinceList,
      cityList,
      districtList,
      projectDetail,
      energyManagerList,
      energyCodeList,
      energyCodeNameMap,
      contractRules,
      projectBaseRules,
      baseForm,
      contractForm,
      hostingForm,
      treeTypeList,
      BenchmarkTypeEnum,
      originalValue,
      hostingRules,
      priceSelectType,
      priceTypeMap,
      hospitals,
      hospitalIdArea,
      incomeCalculationRef,

      mapUserIsOperatorExperts,
      mapUserIsFinancialExperts,
      onEnergyCodeChange,
      mapEnergyUnit,
      addNewArea,
      areaDelete,
      handleAreaNameChange,
      onSave,
      onTreeTypeEnergyCodeChange,
      mapTrustAreaSelectShow,
      onProjectEnergyCodeChange,
      onProjectCheckChange,
      onBenchmarkingTypeChange,
      clearFormValidate,
      onProvinceChange,
      onCityChange,
      onBack,
      checkDisabled,
      onProjectCodeAdd,
      onProjectCodeDelete,
      onSubregionChange,
      hospitalChange,
      checkIsEmpty,
      mapEnergyIconClass,
      mapEnergyIconColor,
      handleTrustSheepDateChange,
    };
  },
});
