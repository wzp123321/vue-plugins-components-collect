import { openBlankUrl } from '@/utils/index';
import { defineComponent, reactive, ref, toRefs, onMounted, toRef, PropType } from 'vue';
import { useRoute } from 'vue-router';
import UnitRankTable from './components/home-uaer-unit-ranktable.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import { switchSortIcons, noConfigImg, rankTypeList } from '@/config/config';

import UnitAreaEnergyRankService from './services/home-unit-area-energy-rank';
import HomeRankService from '../../services/home-rank.service';

export interface TableState {
  tableData: Array<UnitAreaEnergyRankModule.TableListItem>;
  isLoading: boolean;
  isNoData: boolean;
  isNoDataMsg: string;
  isNoConfig: boolean;
  isNoConfigMsg: string;
}
export default defineComponent({
  name: 'UnitAreaEnergyRank',
  components: {
    UnitRankTable,
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
    const title = toRef(props, 'title');
    const route = useRoute();
    const switchIconSelect = ref(1); // 排序选中
    const switchSelect = ref(0); // 颗粒度选中
    const switchItems = rankTypeList; // 颗粒度数据源
    const tableState = reactive<TableState>({
      isLoading: true,
      isNoData: false,
      isNoDataMsg: '暂无数据',
      isNoConfig: false,
      isNoConfigMsg: '暂未配置',
      tableData: [],
    });

    const hRankService = reactive(HomeRankService);
    onMounted(() => {
      getUnitAreaRankData();
    });
    /**
     * 获取单位面积将能耗排名数据
     */
    const getUnitAreaRankData = async () => {
      tableState.isLoading = true;
      tableState.isNoConfig = false;
      tableState.isNoData = false;

      const param = {
        id: props.uid,
        isDesc: switchIconSelect.value,
        timeType: switchSelect.value,
      };
      await UnitAreaEnergyRankService.getUnitAreaRank(param)
        .then((res: HttpRequestModule.ResTemplate<UnitAreaEnergyRankModule.TableListItem[]>) => {
          if (res && res.code === 200 && res.success) {
            if (res.data && res.data.length > 0) {
              tableState.tableData = res.data?.length ? res.data : [];
            } else {
              tableState.isNoData = true;
              tableState.isNoDataMsg = '暂无数据';
            }
          } else {
            tableState.isNoConfig = false;
            tableState.isNoData = false;
            if (res?.message.includes('未配置数据源')) {
              tableState.isNoConfig = true;
            } else {
              tableState.isNoData = true;
            }
            tableState.isNoConfigMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            tableState.isNoDataMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
          }
          tableState.isLoading = false;
          //  console.log(props.code, props.uid);
          // 组件的树结合
          const treeListId =
            tableState.tableData && tableState.tableData.length > 0
              ? tableState.tableData?.map((item) => {
                  return item.treeId;
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
          tableState.isLoading = false;
          tableState.isNoConfig = true;
          if (error && error.message.includes('500')) {
            tableState.isNoConfigMsg = '暂未配置';
          } else {
            tableState.isNoConfigMsg = (error && error.message) || '暂未配置';
          }
          const treeArray = {
            code: props.code,
            uid: props.uid,
            treeIds: [],
          };
          context.emit('getTreeListId', treeArray);
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
      getUnitAreaRankData();
    };
    /**
     * 颗粒度切换事件
     */
    const switchChange = (item: number) => {
      switchSelect.value = item;
      getUnitAreaRankData();
    };
    // 跳转详情
    const linkToDetailPage = () => {
      window.sessionStorage.removeItem('ems-energyRankingLinkParam');
      if (props.configContent) {
        const configContentdata = JSON.parse(props.configContent as any);
        const treeIds =
          tableState.tableData && tableState.tableData.length > 0
            ? tableState.tableData?.map((item) => {
                return item.treeId;
              })
            : [];
        const { treeType, energyCode } = configContentdata;
        const classid = treeType;
        const Itemcode = energyCode;

        const param = {
          classId: classid,
          itemCode: Itemcode,
          reportDate: '',
          areaId: treeIds.length > 0 ? treeIds.toString() : '',
          groupIdList: '',
          valueMean: '3',
        };
        window.sessionStorage.setItem('ems-energyRankingLinkParam', JSON.stringify(param));
      }
      openBlankUrl('/web/energyRanking', 'web', route.query);
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
