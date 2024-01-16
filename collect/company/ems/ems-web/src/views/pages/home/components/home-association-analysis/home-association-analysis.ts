import { defineComponent, ref, reactive, toRefs, onMounted, toRef } from 'vue';
import { useRoute } from 'vue-router';
// 组件
import AssociationAnalysisTable from './components/home-aa-table.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import AssociationAnalysisService from './services/home-association-analysis';
import commonService from '@/services/common/common.service';

// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { openBlankUrl } from '@/utils/index';
import { FBatchRemoveStorageData, FSetStorageData, getCampusParams } from '@/utils/token';
import { Common_IObject } from '@/services/common/common-api';
import { subMonths } from 'date-fns';
// config
import { COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY } from '@/config/session-key';
import { noConfigImg } from '@/config/config';

export interface ItemCode {
  value: string;
  label: string;
}
export interface tableDataState {
  isLoding: boolean;
  isNoData: boolean;
  isNoDataMsg: string;
  isNoConfig: boolean;
  isNoConfigMsg: string;
  tableData: AssociationAnalysisModule.QueryCompareEnergyRes[];
}
export default defineComponent({
  name: 'AssociationAnalysis',
  components: {
    AssociationAnalysisTable,
    'h-component-container': HomeComponentContainer,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props, context) {
    const title = toRef(props, 'title');
    const route = useRoute();
    const { proxy } = useCurrentInstance();
    const switchSelect = ref<string>(''); // 能源类型选中
    const switchItems = ref<any[]>([]); // 能源类型数据
    const downloading = ref<boolean>(false);
    const treeIdList = ref<number[]>([]);
    let switchTimer: NodeJS.Timeout; // 导航按钮防抖定时器

    let correlationTreeInfoMap = reactive<AssociationAnalysisModule.EnergyCodes>({});
    const tableState = reactive<tableDataState>({
      isLoding: true,
      isNoData: false,
      isNoDataMsg: '暂无数据',
      isNoConfig: false,
      isNoConfigMsg: '暂未配置',
      tableData: [],
    });
    // 切换能源类型
    const switchChange = (item: string) => {
      clearTimeout(switchTimer);
      switchSelect.value = item;
      treeIdList.value = correlationTreeInfoMap[item].map((value) => {
        return value.id;
      });

      switchTimer = setTimeout(() => {
        getCompareEnergyData();
      });
    };
    // 初始化
    onMounted(async () => {
      await getCompareConfigData(props.uid);
      FBatchRemoveStorageData([COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY]);
    });
    /**
     * 获取能源类型数据
     */
    const getCompareConfigData = async (id: number) => {
      tableState.isNoConfig = false;
      tableState.isNoData = false;

      await AssociationAnalysisService.getCompareConfig(id)
        .then((res: HttpRequestModule.ResTemplate<AssociationAnalysisModule.QueryCompareConfigRes>) => {
          if (res && res.code === 200 && res.success) {
            if (
              res.data.componentCode &&
              Object.keys(res.data.correlationTreeInfoMap).length > 0 &&
              res.data.energyCodeNameVOList.length > 0
            ) {
              switchItems.value = res.data.energyCodeNameVOList;
              //  给导航按钮排序
              function compare(property: string) {
                return function (label: Common_IObject, value: Common_IObject) {
                  const value1 = label[property];
                  const value2 = value[property];
                  return value1 - value2;
                };
              }
              switchItems.value.sort(compare('value'));
              // 默认初始选中按钮
              switchSelect.value = switchItems.value && switchItems.value.length > 0 ? switchItems.value[0].value : '';
              treeIdList.value = res.data.correlationTreeInfoMap[switchSelect.value].map((item) => {
                return item.id;
              });
              correlationTreeInfoMap = res.data.correlationTreeInfoMap;

              getCompareEnergyData();
            } else {
              tableState.isNoData = true;
              tableState.isNoDataMsg = '暂无数据';
              context.emit('getSwitchItemsOk', tableState.isNoData, props.uid);
            }
          } else {
            tableState.isLoding = false;
            tableState.isNoConfig = true;
            tableState.isNoConfigMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            context.emit('getSwitchItemsOk', tableState.isNoConfig, props.uid);
          }
        })
        .catch((error: Error) => {
          tableState.isLoding = false;
          tableState.isNoConfig = true;
          if (error && error.message.includes('500')) {
            tableState.isNoConfigMsg = '暂未配置';
            context.emit('getSwitchItemsOk', tableState.isNoConfig, props.uid);
          } else {
            tableState.isNoConfigMsg = (error && error.message) || '暂未配置';
            context.emit('getSwitchItemsOk', tableState.isNoConfig, props.uid);
          }
        });
    };
    /**
     * 关联分析列表
     */
    const list: any[] = [];
    let isData: boolean = false;
    const getCompareEnergyData = async () => {
      tableState.isLoding = true;
      tableState.isNoData = false;
      tableState.isNoConfig = false;
      const param = {
        treeIds: treeIdList.value,
        energyCode: switchSelect.value,
        id: props.uid,
      };
      await AssociationAnalysisService.getCompareEnergy(param)
        .then((res: HttpRequestModule.ResTemplate<AssociationAnalysisModule.QueryCompareEnergyRes[]>) => {
          if (res && res.code === 200 && res.success) {
            list.push(res.data);
            list.some((item) => {
              return (isData = item.length > 0 ? true : false);
            });
            if (res.data && res.data.length > 0) {
              tableState.tableData = res.data || [];
              tableState.isNoData = false;
              context.emit('getSwitchItemsOk', tableState.isNoData, props.uid);
            } else {
              if (isData && res.data.length === 0) {
                tableState.tableData = [];
                tableState.isNoData = false;
                tableState.isNoDataMsg = '暂无数据';
                context.emit('getSwitchItemsOk', tableState.isNoData, props.uid);
              } else {
                tableState.isNoData = true;
                tableState.isNoDataMsg = '暂无数据';
                context.emit('getSwitchItemsOk', tableState.isNoData, props.uid);
              }
            }
          } else {
            tableState.isNoConfig = false;
            tableState.isNoData = true;
            tableState.isNoDataMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            context.emit('getSwitchItemsOk', tableState.isNoConfig, props.uid);
          }
        })
        .catch(() => {
          if (switchItems.value.length > 0) {
            tableState.isNoData = true;
            tableState.isNoDataMsg = '暂无数据';
            context.emit('getSwitchItemsOk', tableState.isNoData, props.uid);
          } else {
            tableState.isNoConfig = true;
            tableState.isNoConfigMsg = '暂未配置';
            context.emit('getSwitchItemsOk', tableState.isNoConfig, props.uid);
          }
        })
        .finally(() => {
          tableState.isLoding = false;
        });
    };
    // 跳转详情
    const linkToDetailPage = () => {
      // 存入缓存数据
      FSetStorageData(
        COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY,
        JSON.stringify([subMonths(new Date(), 1), new Date()]),
      );
      openBlankUrl('/web/relationAnalysis', 'web', route.query);
    };
    // 导出
    const onExport = async () => {
      if (downloading.value) {
        return;
      }
      downloading.value = true;
      try {
        const params = {
          id: props.uid,
          energyCode: switchSelect.value,
          treeIds: correlationTreeInfoMap[switchSelect.value].map((item: any) => {
            return item.id;
          }),
          ...getCampusParams(),
        };
        await commonService.getFileStreamDownload(
          params,
          '/energyPortal/exportCorrelationAnalyseExcel',
          '导出',
          () => {
            downloading.value = false;
          },
          () => {
            downloading.value = false;
          },
        );
      } catch (error) {
        proxy.$message.error(error);
        downloading.value = false;
      }
    };

    return {
      ...toRefs(tableState),
      noConfigImg,
      switchSelect,
      switchItems,
      title,

      onExport,
      switchChange,
      linkToDetailPage,
    };
  },
});
