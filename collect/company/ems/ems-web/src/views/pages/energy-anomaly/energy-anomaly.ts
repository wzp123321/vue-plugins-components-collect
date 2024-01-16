import { defineComponent, computed, ref, reactive, toRefs, onMounted, onUnmounted, nextTick } from 'vue';
import { subDays } from 'date-fns';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// component
import ModuleTitle from './components/ea-module-title/ea-module-title.vue';
import EnergyAnomalyCard from './components/ea-card/ea-card.vue';
import EnergyHiddenAnomalyDialog from './components/ea-hidden-anomaly-dialog/ea-hidden-anomaly-dialog.vue';
import EnergyAnomalyDetailDialog from './components/ea-detail-dialog/ea-detail-dialog.vue';
import EnergyCodeSelectBox from './components/ea-energy-code-select-box/ea-energy-code-select-box.vue';
import EnergyAnomalyTree from './components/ea-anomaly-tree/ea-anomaly-tree.vue';
import ProcessedAbnormalDialog from './components/ea-processed-abnormal-dialog/ea-processed-abnormal-dialog.vue';
import EaSwitchTab from './components/ea-switch-tab/ea-switch-tab.vue';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';
import switchTabService from './components/ea-switch-tab/ea-switch-tab.service';
import {
  EA_IPagination,
  EnergyAnomalyTreeState,
  EnergyAnomalySelectState,
  TreeTypeList,
  EAnomalyTypes,
  EA_IActualAnomalyResult,
  EAbnormalTabType,
} from './energy-anomaly.api';
import { EA_ST_TABS, EA_ITabAnomalyNum, EA_NO_AUTHORITY } from './components/ea-switch-tab/ea-switch-tab.api';

// plugin
import elementResizeDetectorMaker from 'element-resize-detector';
import { ElPagination } from 'element-plus';
import anomalyObserver from './utils/observer';
import { getRandomKey } from './utils/index';
import { FGetStorageData } from '@/utils/token';

const nodeKey = 'treeId';
const destroy = new Subject<void>();

export default defineComponent({
  components: {
    ModuleTitle,
    EnergyAnomalyCard,
    EnergyHiddenAnomalyDialog,
    EnergyAnomalyDetailDialog,
    EnergyCodeSelectBox,
    EnergyAnomalyTree,
    ProcessedAbnormalDialog,
    'el-pagination': ElPagination,
    'ea-switch-tab': EaSwitchTab,
  },
  setup() {
    const userName = computed(() => {
      return FGetStorageData('energy-loginName') ?? '';
    });
    const treeTypeList = ref<TreeTypeList[]>([]);
    // 菜单是否展开
    const isMenuCollapsed = ref(false);
    // 初始值
    const queryTreeParams = {
      energyCode: '',
      treeType: 0,
      typeIds: [],
      userName: userName.value,
    };
    // 当前日期
    const curYear = computed(() => {
      return subDays(new Date(), 1).getFullYear();
    });
    const curMonth = computed(() => {
      const month = subDays(new Date(), 1).getMonth() + 1;
      return month > 9 ? month : `0${month}`;
    });
    const curDay = computed(() => {
      const day = subDays(new Date(), 1).getDate();
      return day > 9 ? day : `0${day}`;
    });
    // 实时异常刷新时间
    const actualRefreshDateString = ref<string>('');
    const tabAnomalyCount = ref<EA_ITabAnomalyNum>({
      yesterdayAlarmNumber: 0,
      actualTimeAlarmNumber: 0,
      boundaryAlarmNumber: 0,
    });
    const currentTab = ref<string>(EA_ST_TABS.实时异常);
    const hasAuthority = ref<boolean>(true);
    const actualAnomalyList = ref<EA_IActualAnomalyResult[]>([]);
    const boundaryAnomalyList = ref<EA_IActualAnomalyResult[]>([]);
    // 隐藏异常弹框
    const hiddenAnomalyDialog = ref(null);
    // 详情弹框
    const anomalyDetailDialog = ref(null);
    // 已处理异常弹框
    const processedRef = ref(null);
    const showAnomalyTypeList = computed(() => {
      let list = energyAnomalyTreeState.anomalyTypeList;
      switch (currentTab.value) {
        case EA_ST_TABS.实时异常:
          list = [
            {
              id: EAnomalyTypes.用能异常,
              name: '用能异常',
            },
          ];
          break;
        case EA_ST_TABS.边界异常:
          list = [
            {
              id: EAnomalyTypes.边界异常,
              name: '边界异常',
            },
          ];
          break;
        case EA_ST_TABS.昨日异常:
          list = energyAnomalyTreeState.anomalyTypeList;
          break;
      }
      return list;
    });
    // 分页
    const pagination = ref<EA_IPagination>({
      pageNum: 1,
      pageSize: 60,
      total: 0,
    });
    const showAnomalyList = ref<EnergyAnomalyModule.AnomalyInfo[]>([]);
    const total = computed(() => {
      return energyAnomalySelectState.anomalyList?.length;
    });
    // 左侧筛选模块
    const treeSelectModule = () => {
      // 打开弹框
      const onHiddenAnomalyDialogShow = () => {
        if (hiddenAnomalyDialog.value) {
          (hiddenAnomalyDialog.value as any).show();
        }
      };
      // 打开已处理异常弹框
      const onProcessedAbnormalDialogShow = () => {
        if (processedRef.value) {
          (processedRef.value as any).show();
        }
      };
      // 查询事件
      const onSearch = async () => {
        pagination.value.pageNum = 1;

        await queryAnomalyTreeList();
        queryAnomalyTreeListCb();
      };
      // 初始化左侧能耗异常类型 分类分项
      const queryInitailParamsFn = async () => {
        try {
          const promiseArr: [
            Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyCodeInfo[]>>,
            Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyType[]>>,
            Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyTreeType[]>>,
          ] = [
            energyAnomalyService.getEnergyCodeList(),
            energyAnomalyService.getAnomalyTypeList(),
            energyAnomalyService.getEnergyTreeTypeData(),
          ];
          energyAnomalyTreeState.treeLoading = true;

          const resArr = await Promise.all(promiseArr);
          if (resArr && resArr.length) {
            if (resArr[0] && resArr[0].code === 200 && resArr[0].data) {
              energyAnomalyTreeState.energyCodeList = resArr[0].data;
              energyAnomalyTreeState.queryTreeParams.energyCode =
                energyAnomalyTreeState.energyCodeList && energyAnomalyTreeState.energyCodeList.length > 0
                  ? energyAnomalyTreeState.energyCodeList[0].code
                  : '';
              energyAnomalySelectState.queryAnomalyListParams.energyCode =
                energyAnomalyTreeState.queryTreeParams.energyCode;
            } else {
              energyAnomalySelectState.loading = false;
              energyAnomalyTreeState.treeLoading = false;
              energyAnomalySelectState.anomalyList = [];
              energyAnomalySelectState.showNoData = true;

              pagination.value.pageNum = 1;
              pagination.value.total = 0;
              showAnomalyList.value = [];
            }
            if (resArr[1] && resArr[1].code === 200 && resArr[1].data) {
              energyAnomalyTreeState.anomalyTypeList = resArr[1].data;
            } else {
              energyAnomalyTreeState.anomalyTypeList = [];
              energyAnomalyTreeState.treeLoading = false;
              energyAnomalySelectState.loading = false;
            }
            if (resArr[2] && resArr[2].code === 200 && resArr[2].data) {
              const list: TreeTypeList[] = [];
              resArr[2]?.data?.forEach((item) => {
                list.push({
                  value: Number(item.treeType),
                  label: item.typeName,
                });
              });
              queryTreeParams.treeType = list[0].value;
              energyAnomalyTreeState.queryTreeParams.treeType = list[0].value;
              treeTypeList.value = list;
            } else {
              energyAnomalyTreeState.treeLoading = false;
              energyAnomalySelectState.loading = false;
            }
          }
        } catch (error) {
          energyAnomalyTreeState.showTreeNoData = true;
          energyAnomalySelectState.loading = false;
          energyAnomalyTreeState.treeLoading = false;
          energyAnomalySelectState.showNoData = true;
        }
      };
      // 区域业态切换
      const onTreeTypeChange = (value: number) => {
        energyAnomalyTreeState.queryTreeParams.treeType = value;
        energyAnomalyTreeState.treeFilterText = '';
        energyAnomalySelectState.loading = true;

        pagination.value.pageNum = 1;

        onSearch();
      };
      // 树节点点击
      const onTreeSelect = (value: EnergyAnomalyModule.AnomalyTree) => {
        energyAnomalySelectState.queryAnomalyListParams.treeId = value.treeId;
        energyAnomalyTreeState.currentTreeNodeName = value.treeName;

        pagination.value.pageNum = 1;

        switch (currentTab.value) {
          case EA_ST_TABS.实时异常:
            queryActualAnomalyRefreshDate();
            queryActualAnomalyList();
            break;
          case EA_ST_TABS.昨日异常:
            energyAnomalySelectState.queryAnomalyList();
            break;
          case EA_ST_TABS.边界异常:
            queryActualAnomalyRefreshDate();
            queryBoundaryAnomalyList();
            break;
        }
      };
      // 请求树列表
      const queryAnomalyTreeList = async () => {
        try {
          energyAnomalyTreeState.treeLoading = true;
          energyAnomalySelectState.loading = true;
          energyAnomalyTreeState.showTreeNoData = false;
          console.log(energyAnomalyTreeState.queryTreeParams);
          const res =
            currentTab.value === EA_ST_TABS.实时异常
              ? await energyAnomalyService.getRatioAnomalyTreeList(energyAnomalyTreeState.queryTreeParams)
              : currentTab.value === EA_ST_TABS.边界异常
              ? await energyAnomalyService.getBoundaryAnomalyTreeList(energyAnomalyTreeState.queryTreeParams)
              : await energyAnomalyService.getAnomalyTreeList(energyAnomalyTreeState.queryTreeParams);
          if (res && res.code === 200 && res.data && res.data.length) {
            energyAnomalyTreeState.anomalyTreeList = res.data;
            energyAnomalyTreeState.showTreeNoData = false;
          } else {
            energyAnomalyTreeState.anomalyTreeList = [];
            energyAnomalySelectState.anomalyList = [];
            energyAnomalyTreeState.showTreeNoData = true;
            energyAnomalySelectState.showNoData = true;
            if (res.code !== 200) {
              energyAnomalySelectState.showNoData = true;
            }
            energyAnomalySelectState.loading = false;

            pagination.value.pageNum = 1;
            pagination.value.total = 0;
            showAnomalyList.value = [];
          }
        } catch (error) {
          energyAnomalyTreeState.anomalyTreeList = [];
          energyAnomalySelectState.anomalyList = [];
          energyAnomalySelectState.showNoData = true;
          energyAnomalyTreeState.showTreeNoData = true;
          energyAnomalySelectState.loading = false;

          pagination.value.pageNum = 1;
          pagination.value.total = 0;
          showAnomalyList.value = [];
        } finally {
          energyAnomalyTreeState.treeLoading = false;
        }
      };
      /**
       * 请求完树节点后操作
       * 1.查询各类型异常数量
       * 2.查询刷新时间
       * @returns
       */
      const queryAnomalyTreeListCb = () => {
        queryTabAnomalyCount();
        if (currentTab.value !== EA_ST_TABS.昨日异常) {
          queryActualAnomalyRefreshDate();
        }

        if (!energyAnomalyTreeState.anomalyTreeList || energyAnomalyTreeState.anomalyTreeList.length === 0) {
          energyAnomalySelectState.loading = false;
          energyAnomalyTreeState.treeLoading = false;
          return;
        }
        energyAnomalySelectState.queryAnomalyListParams = {
          ...energyAnomalyTreeState.queryTreeParams,
          treeId: energyAnomalyTreeState.anomalyTreeList?.length
            ? !energyAnomalyTreeState.anomalyTreeList[0]?.lockFlag
              ? energyAnomalyTreeState.anomalyTreeList[0].treeId
              : energyAnomalyTreeState.anomalyTreeList[0].childTree?.length
              ? energyAnomalyTreeState.anomalyTreeList[0]?.childTree[0].treeId
              : -1
            : -1,
        };
        if (energyAnomalySelectState.queryAnomalyListParams?.treeId !== -1) {
          energyAnomalyTreeState.currentTreeNodeName = energyAnomalyTreeState.anomalyTreeList?.length
            ? !energyAnomalyTreeState.anomalyTreeList[0]?.lockFlag
              ? energyAnomalyTreeState.anomalyTreeList[0].treeName
              : energyAnomalyTreeState.anomalyTreeList[0]?.childTree?.length
              ? energyAnomalyTreeState.anomalyTreeList[0]?.childTree[0].treeName
              : ''
            : '';

          switch (currentTab.value) {
            case EA_ST_TABS.实时异常:
              queryActualAnomalyList();
              break;
            case EA_ST_TABS.昨日异常:
              energyAnomalySelectState.queryAnomalyList();
              break;
            case EA_ST_TABS.边界异常:
              queryBoundaryAnomalyList();
              break;
          }
        } else {
          energyAnomalySelectState.loading = false;
          energyAnomalyTreeState.treeLoading = false;
          energyAnomalySelectState.showNoData = true;
        }
      };
      const energyAnomalyTreeState = reactive<EnergyAnomalyTreeState>({
        treeFilterText: '',
        typeIds: [],
        anomalyTypeList: [],
        energyCodeList: [],
        anomalyTreeList: [],
        treeLoading: false,
        showTreeNoData: false,
        hasHideAbnormalFlag: false,
        currentTreeNodeName: '',
        queryTreeParams: cloneDeep(queryTreeParams),
        onTreeSelect,
        onTreeTypeChange,
        queryInitailParamsFn,
        queryAnomalyTreeList,
        queryAnomalyTreeListCb,
        onHiddenAnomalyDialogShow,
        onProcessedAbnormalDialogShow,
        onSearch,
      });
      return { energyAnomalyTreeState };
    };
    // 右侧列表模块
    const anomalyQueryModule = () => {
      const queryAnomalyListParams = {
        ...queryTreeParams,
        treeId: 0,
      };
      // 刷新数据
      const onOperateRefresh = async () => {
        await energyAnomalyTreeState.queryAnomalyTreeList();
        switch (currentTab.value) {
          case EA_ST_TABS.实时异常:
            queryActualAnomalyRefreshDate();
            queryActualAnomalyList();
            break;
          case EA_ST_TABS.昨日异常:
            energyAnomalySelectState.queryAnomalyList();
            break;
          case EA_ST_TABS.边界异常:
            queryActualAnomalyRefreshDate();
            queryBoundaryAnomalyList();
            break;
        }

        queryTabAnomalyCount();
        await getHideAbnormalList();
      };
      // 请求树节点对应异常列表
      const queryAnomalyList = async () => {
        try {
          energyAnomalySelectState.loading = true;
          energyAnomalySelectState.anomalyList = [];
          energyAnomalySelectState.showNoData = false;
          const res = await energyAnomalyService.getAnomalyList(energyAnomalySelectState.queryAnomalyListParams);
          if (res && res.code === 200) {
            if (res.data?.length) {
              energyAnomalySelectState.anomalyList = res.data;
              energyAnomalySelectState.showNoData = false;

              pagination.value.total = energyAnomalySelectState.anomalyList?.length;

              // showAnomalyList.value = energyAnomalySelectState.anomalyList?.slice(
              //   (pagination.value.pageNum - 1) * pagination.value.pageSize,
              //   pagination.value.pageNum * pagination.value.pageSize,
              // );

              // // 如果当前页没有数据 且有数据
              // if (
              //   pagination.value.total > 0 &&
              //   pagination.value.pageNum > 1 &&
              //   Math.ceil(pagination.value.total / pagination.value.pageSize) < pagination.value.pageNum
              // ) {
              //   pagination.value.pageNum = pagination.value.pageNum - 1;
              //   showAnomalyList.value = energyAnomalySelectState.anomalyList?.slice(
              //     0,
              //     pagination.value.pageNum * pagination.value.pageSize,
              //   );
              // }

              nextTick(() => {
                getCardObserver();
              });
            } else {
              energyAnomalySelectState.anomalyList = [];
              energyAnomalySelectState.showNoData = true;

              pagination.value.pageNum = 1;
              pagination.value.total = 0;
              showAnomalyList.value = [];
            }
          } else {
            energyAnomalySelectState.showNoData = true;
            energyAnomalySelectState.anomalyList = [];

            pagination.value.pageNum = 1;
            pagination.value.total = 0;
            showAnomalyList.value = [];
          }
        } catch (error) {
          energyAnomalySelectState.anomalyList = [];
          energyAnomalySelectState.showNoData = true;

          pagination.value.pageNum = 1;
          pagination.value.total = 0;
          showAnomalyList.value = [];
        } finally {
          energyAnomalySelectState.loading = false;
        }
      };
      /**
       * 加载异常详情
       * @param treeId 树节点
       * @param abnormalTime 异常时间（）
       */
      const onAnomalyItemClick = (treeId: number, id: number, abnormalTime?: string) => {
        const { energyCode, treeType, typeIds } = energyAnomalySelectState.queryAnomalyListParams;
        energyAnomalySelectState.queryAnomalyDetailParams = {
          id,
          energyCode,
          userName: userName.value,
          treeType,
          typeIds,
          treeId,
          abnormalTime,
        };
        if (anomalyDetailDialog.value) {
          nextTick(() => {
            (anomalyDetailDialog.value as any).show();
          });
        }
      };

      const energyAnomalySelectState = reactive<EnergyAnomalySelectState>({
        loading: true,
        showNoData: false,
        queryAnomalyListParams,
        queryAnomalyDetailParams: {
          ...cloneDeep(queryAnomalyListParams),
          id: 0,
        },
        anomalyList: [],
        queryAnomalyList,
        onOperateRefresh,
        onAnomalyItemClick,
      });
      return { energyAnomalySelectState };
    };
    const { energyAnomalyTreeState } = treeSelectModule();
    const { energyAnomalySelectState } = anomalyQueryModule();

    // 查询是否有隐藏的异常
    const getHideAbnormalList = async () => {
      try {
        const res = await energyAnomalyService.getPersonalHiddenAnomalyList();
        if (res && res.code === 200 && res.data) {
          energyAnomalyTreeState.hasHideAbnormalFlag = res.data?.length > 0;
        } else {
          energyAnomalyTreeState.hasHideAbnormalFlag = false;
        }
      } catch (error) {
        energyAnomalySelectState.loading = false;
        energyAnomalyTreeState.hasHideAbnormalFlag = false;
      }
    };
    /**
     * 分页加载
     * @param value
     */
    const onCurrentChange = (value: number) => {
      pagination.value.pageNum = value;
      showAnomalyList.value = energyAnomalySelectState.anomalyList?.slice(
        (pagination.value.pageNum - 1) * pagination.value.pageSize,
        pagination.value.pageNum * pagination.value.pageSize,
      );
    };
    /**
     * 查询实时异常
     */
    const queryActualAnomalyList = async () => {
      try {
        actualAnomalyList.value = [];
        energyAnomalySelectState.loading = true;
        energyAnomalySelectState.showNoData = false;
        const res = await energyAnomalyService.getActualAnomalyList({
          ...energyAnomalySelectState.queryAnomalyListParams,
          typeIds: [EAnomalyTypes.用能异常],
        });
        if (res?.code === 200 && res?.data?.length) {
          actualAnomalyList.value = res?.data?.map((item) => {
            return {
              abnormalTime: item?.abnormalTime ?? '',
              abnormalShowTime: item?.abnormalShowTime ?? '',
              abnormalTreeCardList:
                item?.abnormalTreeCardList?.map((childItem) => {
                  return {
                    abnormalDay: childItem?.abnormalDay ?? 0,
                    abnormalNumber: childItem?.abnormalNumber ?? 0,
                    treeId: childItem?.treeId ?? 0,
                    treeName: childItem?.treeName ?? '',
                    treePath: childItem?.treePath ?? '',
                  };
                }) ?? [],
            };
          });
          actualAnomalyList.value = actualAnomalyList.value?.filter((item) => {
            return item?.abnormalTreeCardList?.length > 0;
          });

          if (actualAnomalyList.value?.length === 0) {
            energyAnomalySelectState.showNoData = true;
          }

          nextTick(() => {
            getCardObserver();
          });
        } else {
          actualAnomalyList.value = [];
          energyAnomalySelectState.showNoData = true;
        }
      } catch (error) {
        energyAnomalySelectState.showNoData = true;
        actualAnomalyList.value = [];
      } finally {
        energyAnomalySelectState.loading = false;
      }
    };
    /**
     * 查询边界异常列表
     */
    const queryBoundaryAnomalyList = async () => {
      try {
        energyAnomalySelectState.showNoData = false;
        energyAnomalySelectState.loading = true;
        const res = await energyAnomalyService.getBoundaryAnomalyList(energyAnomalySelectState.queryAnomalyListParams);
        if (res?.code === 200 && res?.data?.length) {
          boundaryAnomalyList.value = res?.data ?? [];

          nextTick(() => {
            getCardObserver();
          });
        } else {
          boundaryAnomalyList.value = [];
          energyAnomalySelectState.showNoData = true;
        }
      } catch (error) {
        energyAnomalySelectState.showNoData = true;
        boundaryAnomalyList.value = [];
      } finally {
        energyAnomalySelectState.loading = false;
      }
    };
    /**
     * 查询实时异常刷新时间
     */
    const queryActualAnomalyRefreshDate = async () => {
      try {
        energyAnomalySelectState.loading = true;
        const res = await energyAnomalyService.getActualAnomalyRefreshTime(
          currentTab.value === EA_ST_TABS.实时异常 ? EAbnormalTabType.用能异常 : EAbnormalTabType.边界异常,
        );
        if (res?.code === 200 && res?.data?.lastTime) {
          actualRefreshDateString.value = res?.data?.lastTime ?? '';
        } else {
          actualRefreshDateString.value = '';
        }
      } catch (error) {
        actualRefreshDateString.value = '';
      } finally {
        energyAnomalySelectState.loading = false;
      }
    };
    /**
     * 查询各tab下的数量
     */
    const queryTabAnomalyCount = async () => {
      try {
        const res = await energyAnomalyService.getTabAbnormalNumber();
        if (res?.code === 200 && res?.data) {
          tabAnomalyCount.value = res?.data
            ? {
                actualTimeAlarmNumber: res?.data?.actualTimeAlarmNumber ?? 0,
                boundaryAlarmNumber: res?.data?.boundaryAlarmNumber ?? 0,
                yesterdayAlarmNumber: res?.data?.yesterdayAlarmNumber ?? 0,
              }
            : {
                actualTimeAlarmNumber: 0,
                boundaryAlarmNumber: 0,
                yesterdayAlarmNumber: 0,
              };
        }
      } catch (error) {
        tabAnomalyCount.value = {
          actualTimeAlarmNumber: 0,
          boundaryAlarmNumber: 0,
          yesterdayAlarmNumber: 0,
        };
      }
    };
    /**
     * 观察各个卡片
     */
    const getCardObserver = () => {
      const cards = Array.from(document.getElementsByClassName('ea-card'));
      if (cards?.length) {
        (cards as any)?.forEach((item: any) => {
          anomalyObserver.observe(item as HTMLElement);
        });
      }
    };
    const checkAuthority = () => {
      let tabs = FGetStorageData('ems-authority-buttons');
      if (!FGetStorageData('ems-authority-buttons')) {
        return false;
      }
      tabs = !!tabs ? JSON.parse(tabs) : [];
      if (tabs?.length === 0) {
        return false;
      }
      return true;
    };
    /**
     * 初始化
     * 监听tab切换
     * 1.请求异常类型、分类分项
     * 2.请求tree
     */
    onMounted(async () => {
      if (checkAuthority()) {
        hasAuthority.value = false;
        energyAnomalyTreeState.anomalyTreeList = [];
        energyAnomalySelectState.anomalyList = [];
        energyAnomalySelectState.loading = false;
        energyAnomalyTreeState.treeLoading = false;
        energyAnomalyTreeState.showTreeNoData = true;
        energyAnomalySelectState.showNoData = true;

        return;
      }
      await energyAnomalyTreeState.queryInitailParamsFn();

      switchTabService.anomalyTabResult$.pipe(takeUntil(destroy)).subscribe((v) => {
        if (!!v) {
          hasAuthority.value = true;
          currentTab.value = v;
          // 重置部分字段
          energyAnomalyTreeState.treeFilterText = '';
          energyAnomalyTreeState.queryTreeParams.treeType =
            treeTypeList.value?.length > 0 ? treeTypeList.value?.[0].value : 1;
          energyAnomalyTreeState.queryTreeParams.energyCode =
            energyAnomalyTreeState.energyCodeList?.length > 0 ? energyAnomalyTreeState.energyCodeList?.[0].code : '';
          energyAnomalyTreeState.queryTreeParams.typeIds = [];

          if (v === EA_ST_TABS.实时异常) {
            energyAnomalyTreeState.queryTreeParams.typeIds = [EAnomalyTypes.用能异常];
          } else if (v === EA_ST_TABS.边界异常) {
            energyAnomalyTreeState.queryTreeParams.typeIds = [EAnomalyTypes.边界异常];
          }
          if (energyAnomalyTreeState.energyCodeList?.length === 0) {
            energyAnomalySelectState.loading = false;
            energyAnomalyTreeState.showTreeNoData = true;
            return;
          }

          energyAnomalySelectState.loading = true;
          energyAnomalyTreeState.onSearch();
          getHideAbnormalList();
        }
      });
      try {
        const erd = elementResizeDetectorMaker();
        const element = document.querySelector('.energy-anomaly__content');
        if (!element) {
          return;
        }
        erd.listenTo(element, (ele: Element) => {
          const widthStr = getComputedStyle(ele).getPropertyValue('width');
          const width = Number(widthStr.replace('px', ''));
          isMenuCollapsed.value = width >= 1418;
        });
      } catch (error) {
        energyAnomalySelectState.loading = false;
      }
    });
    /**
     * 页面销毁
     */
    onUnmounted(() => {
      destroy.next();
      destroy.complete();
    });

    return {
      ...toRefs(energyAnomalyTreeState),
      ...toRefs(energyAnomalySelectState),
      processedRef,
      hiddenAnomalyDialog,
      anomalyDetailDialog,
      nodeKey,
      curYear,
      curMonth,
      curDay,
      userName,
      treeTypeList,
      isMenuCollapsed,
      currentTab,
      EA_ST_TABS,
      total,
      pagination,
      showAnomalyList,
      actualRefreshDateString,
      actualAnomalyList,
      showAnomalyTypeList,
      tabAnomalyCount,
      boundaryAnomalyList,
      hasAuthority,

      onCurrentChange,
      getRandomKey,
      getHideAbnormalList,
    };
  },
});
