import { defineComponent, reactive, ref, toRefs, onMounted, toRef, PropType } from 'vue';
import RankTable from './components/home-ecr-ranktable.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import { switchSortIcons, noConfigImg, rankTypeList } from '@/config/config';

import EnergyConsumptionRankService from './services/home-energy-consumption-rank';
import HomeRankService from '../../services/home-rank.service';

import { openBlankUrl } from '@/utils/index';
import { useRoute } from 'vue-router';

export interface TableState {
  tableData: EnergyConsumptionRankModule.TableListItem[];
  tableColumnTitle: string;
  isLoading: boolean;
  isNoData: boolean;
  isNoDataMsg: string;
  isNoConfig: boolean;
  isNoConfigMsg: string;
}

export default defineComponent({
  name: 'EnergyConsumptionRank',
  components: {
    RankTable,
    'h-component-container': HomeComponentContainer,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
    code: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    configContent: {
      type: String,
      default: '',
    },
  },
  setup(props, context) {
    const route = useRoute();
    const title = toRef(props, 'title');
    const configContent = toRef(props, 'configContent');
    const switchIconSelect = ref(1); // 排序选中
    const switchSelect = ref(0); // 颗粒度选中
    const switchItems = rankTypeList; // 颗粒度数据源
    const tableState = reactive<TableState>({
      isLoading: false,
      isNoData: false,
      isNoDataMsg: '暂无数据',
      isNoConfig: false,
      isNoConfigMsg: '暂未配置',
      tableColumnTitle: '',
      tableData: [],
    });
    const hRankService = reactive(HomeRankService);

    onMounted(() => {
      getConsumptionRankData();
    });
    /**
     * 获取能耗排名数据
     */
    const getConsumptionRankData = async () => {
      tableState.isLoading = true;
      tableState.isNoConfig = false;
      tableState.isNoData = false;

      const param = {
        id: props.uid,
        sort: switchIconSelect.value,
        timeType: switchSelect.value,
      };
      await EnergyConsumptionRankService.getConsumptionRank(param)
        .then((res: HttpRequestModule.ResTemplate<EnergyConsumptionRankModule.TableRes>) => {
          if (res && res.code === 200) {
            if (res.data.treeVoList && res.data.treeVoList.length > 0) {
              tableState.tableData = res.data.treeVoList?.length ? res.data.treeVoList : [];
              const { energyName, unit } = res.data;
              tableState.tableColumnTitle = (energyName || '') + (unit ? `（${unit}）` : '');
            } else {
              tableState.isNoData = true;
              tableState.isNoDataMsg = '暂无数据';
            }
          } else {
            tableState.isNoConfig = res?.message.includes('未配置数据源');
            tableState.isNoData = !tableState.isNoConfig;
            tableState.isNoConfigMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            tableState.isNoDataMsg = tableState.isNoConfigMsg;
          }

          const treeListId =
            tableState.tableData && tableState.tableData.length > 0
              ? tableState.tableData.map((item) => {
                  return item.id;
                })
              : [];
          hRankService.getTreeList(treeListId);
          const treeArray = {
            code: props.code,
            uid: props.uid,
            treeIds: treeListId,
          };
          context.emit('getTreeListId', treeArray);
        })
        .catch((error: Error) => {
          tableState.isNoConfig = true;
          if (error && error.message.includes('500')) {
            tableState.isNoConfigMsg = '暂未配置';
          } else {
            tableState.isNoConfigMsg = (error && error.message) || '暂未配置';
          }
        })
        .finally(() => {
          tableState.isLoading = false;
        });
    };
    /**
     * 排序切换事件
     */
    const switchIconChange = (item: number) => {
      switchIconSelect.value = item;
      getConsumptionRankData();
    };
    // 跳转详情
    const linkToDetailPage = () => {
      window.sessionStorage.removeItem('ems-energyRankingLinkParam');
      // console.log('props.configContent=====', props.configContent);
      if (configContent.value) {
        const configContentdata = JSON.parse(configContent.value as any);

        const { treeType, energyCode } = configContentdata;
        const treeIds =
          tableState.tableData && tableState.tableData.length > 0
            ? tableState.tableData.map((item) => {
                return item.id;
              })
            : [];
        const classid = treeType;
        const Itemcode = energyCode;

        const param = {
          classId: classid,
          itemCode: Itemcode,
          reportDate: '',
          areaId: treeIds.length > 0 ? treeIds.toString() : '',
          groupIdList: '',
          valueMean: '1',
        };
        // console.log('param====', param);
        window.sessionStorage.setItem('ems-energyRankingLinkParam', JSON.stringify(param));
      } else {
      }
      openBlankUrl('/web/energyRanking', 'web', route.query);
    };
    /**
     * 颗粒度切换事件
     */
    const switchChange = (item: number) => {
      switchSelect.value = item;
      getConsumptionRankData();
    };
    return {
      ...toRefs(tableState),
      switchIconSelect,
      switchSortIcons,
      switchSelect,
      switchItems,
      noConfigImg,
      title,

      switchIconChange,
      switchChange,
      linkToDetailPage,
    };
  },
});
