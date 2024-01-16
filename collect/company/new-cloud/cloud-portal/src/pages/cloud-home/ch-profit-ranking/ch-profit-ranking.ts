import { interval, Subject, takeUntil } from 'rxjs';
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { CH_ProfitRankTimeType, CH_SurplusListType } from './ch-profit-ranking.api';
import pRankingService from './ch-profit-ranking.service';

export default defineComponent({
  name: 'ProfitRankingComponent',
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    onMounted(() => {
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          pRankEnergy.queryProfitRankingList(timeSelect.value);
        });
    });

    //#region 盈利排行榜服务
    const pRankEnergy = reactive(pRankingService);

    let rankData = ref<CH_SurplusListType[]>([]);
    let unit = ref<string>();

    pRankEnergy.profitRankData.pipe(takeUntil(_destroy$)).subscribe((v) => {
      if (v) {
        rankData.value = v.surplusRankList;
        unit.value = v.unit;
      } else {
        rankData.value = [];
      }
      //  console.log(rankData.value);
    });
    /**
     * 给不同排序的不同样式
     * @param rankOrder 排序
     * @returns
     */
    const infobg = (rankOrder: number) => {
      let name;
      switch (rankOrder) {
        case 1:
          name = 'first';
          break;
        case 2:
          name = 'second';
          break;
        case 3:
          name = 'third';
          break;
        case 4:
          name = 'four';
          break;
        case 5:
          name = 'five';
          break;
        default:
          return;
      }
      return 'ch-pr-content-info-' + name;
    };

    // 默认历史累计
    let timeSelect = ref<string>('0');
    //   pRankEnergy.queryProfitRankingList(timeSelect.value);
    const timeChange = (item: { label: string; value: string }) => {
      rankData.value = [];
      if (pRankEnergy.isClick) {
        timeSelect.value = item.value;
        pRankEnergy.queryProfitRankingList(timeSelect.value);
      }
    };
    //#endregion

    //#region toopyip
    /**
     * 节点数据悬浮， tooltip的name，定位
     * @param item 节点详情
     * @returns
     */
    let isTooltip = ref<boolean>(false);
    let tooltipPosition = ref<any>();
    let tooltipName = ref<any>();
    const tooltipChange = (item: CH_SurplusListType) => {
      isTooltip.value = true;
      // console.log(item.rankOrder);
      let name;
      switch (item.rankOrder) {
        case 1:
          tooltipPosition.value = {
            top: '0.38rem',
            visibility: 'visible',
            marginLeft: '0.3rem',
          };
          tooltipName.value = item.surplus;
          break;
        case 2:
          tooltipPosition.value = {
            top: '0.55rem',
            visibility: 'visible',
            left: '1.28rem',
          };
          tooltipName.value = item.surplus;
          break;
        case 3:
          tooltipPosition.value = {
            top: '0.68rem',
            visibility: 'visible',
            right: '1.1rem',
          };
          tooltipName.value = item.surplus;
          break;
        case 4:
          tooltipPosition.value = {
            top: '0.8rem',
            visibility: 'visible',
            left: '0.66rem',
          };
          tooltipName.value = item.surplus;
          break;
        case 5:
          tooltipPosition.value = {
            top: '0.98rem',
            visibility: 'visible',
            right: '0.55rem',
          };
          tooltipName.value = item.surplus;
          break;
        default:
          return;
      }
      // console.log(tooltipName.value, isTooltip.value);
    };
    /**
     * 节点数据移出，隐藏tooltip
     * @param orderIndex 节点详情排名
     */
    const tooltipOut = (orderIndex: number) => {
      isTooltip.value = false;
    };

    /**
     * 节点name悬浮， tooltip的name，定位
     * @param item 节点详情
     * @returns
     */
    const tooltipNameChange = (item: CH_SurplusListType) => {
      isTooltip.value = true;
      let name;
      switch (item.rankOrder) {
        case 1:
          tooltipPosition.value = {
            bottom: '0.4rem',
            visibility: 'visible',
          };
          tooltipName.value = item.tenantName;
          break;
        case 2:
          tooltipPosition.value = {
            bottom: '0.4rem',
            visibility: 'visible',
            left: '0.8rem',
          };
          tooltipName.value = item.tenantName;
          break;
        case 3:
          tooltipPosition.value = {
            bottom: '0.4rem',
            visibility: 'visible',
            right: '0.7rem',
          };
          tooltipName.value = item.tenantName;
          break;
        case 4:
          tooltipPosition.value = {
            bottom: '0.4rem',
            visibility: 'visible',
            left: '0.3rem',
          };
          tooltipName.value = item.tenantName;
          break;
        case 5:
          tooltipPosition.value = {
            bottom: '0.4rem',
            visibility: 'visible',
            right: '0.1rem',
          };
          tooltipName.value = item.tenantName;
          break;
        default:
          return;
      }
    };

    /**
     * 节点name移出，隐藏tooltip
     * @param orderIndex 节点详情排名
     */
    const tooltipNameOut = (orderIndex: number) => {
      isTooltip.value = false;
    };
    //#endregion
    return {
      pRankEnergy,
      rankData,
      unit,
      infobg,
      timeSelect,
      timeChange,
      isTooltip,
      tooltipChange,
      tooltipOut,
      tooltipPosition,
      tooltipNameChange,
      tooltipNameOut,
      tooltipName,
    };
  },
  computed: {
    timeChangeList: (): Array<{ label: string; value: CH_ProfitRankTimeType }> =>
      Object.entries(CH_ProfitRankTimeType)
        .filter(([k, v]) => typeof v === 'string')
        .map(([k, v]) => ({ label: k, value: v as CH_ProfitRankTimeType })),
  },
});
