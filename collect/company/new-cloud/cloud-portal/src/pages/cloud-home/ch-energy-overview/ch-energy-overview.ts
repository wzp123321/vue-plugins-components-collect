import { defineComponent, onMounted, reactive, ref } from 'vue';

import eoService from './ch-energy-overview.service';
import {
  CH_EnergyOverviewType,
  CH_EnergyParamType,
  CH_EnergyQueryType,
  CH_EnergyQueryUrl,
} from './ch-energy-overview.api';
import { interval, Subject, takeUntil } from 'rxjs';

export default defineComponent({
  name: 'EnergyOverviewComponent',
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    onMounted(() => {
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          sEnergy.queryEnergySavingRankList({ queryFlag: energySelect.value });
        });
    });

    const sEnergy = reactive(eoService);

    //#region 类别变化默认为目标达成
    let energySelect = ref<string>('1');
    sEnergy.queryEnergySavingRankList({ queryFlag: energySelect.value });

    const energyChange = (item: { label: string; value: CH_EnergyQueryType }) => {
      if (sEnergy.isClick) {
        energySelect.value = item.value;
        const param: CH_EnergyParamType = {
          queryFlag: energySelect.value,
        };
        sEnergy.queryEnergySavingRankList(param);
      }
    };
    //#endregion

    const energyBodyUrl = (type: CH_EnergyQueryUrl) => {
      return new URL(CH_EnergyQueryUrl[+type], import.meta.url).href;
    };

    const infobg = (index: number) => {
      let name;
      switch (index) {
        case 1:
          name = 'first';
          break;
        case 2:
          name = 'second';
          break;
        case 3:
          name = 'third';
          break;
        default:
          return;
      }
      return 'ch-eo-content-info-' + name;
    };

    const energyRateValue = (item: number) => {
      let name;
      //  console.log(item);
      switch (+item) {
        case 0:
          name = 'ch-eo-content-info-name-rate';
          break;
        case 1:
          name = 'ch-eo-content-info-name';
          break;
        default:
          return;
      }
      //  console.log(name);
      return name;
    };

    //#region toopyip
    /**
     * 节点数据悬浮， tooltip的name，定位
     * @param item 节点详情
     * @returns
     */
    let isTooltip = ref<boolean>(false);
    let tooltipPosition = ref<any>();
    let tooltipName = ref<any>();
    const tooltipChange = (item: CH_EnergyOverviewType, type: string) => {
      isTooltip.value = true;
      //  console.log(item.rankOrder);
      let name;
      switch (item.rankOrder) {
        case 1:
          if (type === 'differenceRate') {
            tooltipPosition.value = {
              top: '1.75rem',
              visibility: 'visible',
            };
            if (energySelect.value === '1') {
              tooltipName.value = item.differenceRate + item.ratioUnit;
            } else {
              tooltipName.value = item.savingRate + item.ratioUnit;
            }
          }

          if (type === 'savingRate') {
            tooltipPosition.value = {
              top: '2.06rem',
              visibility: 'visible',
            };
            tooltipName.value = '实际' + item.savingRate + item.ratioUnit;
          }

          if (type === 'targetRate') {
            tooltipPosition.value = {
              top: '2.27rem',
              visibility: 'visible',
            };
            tooltipName.value = '目标' + item.targetRate + item.ratioUnit;
          }

          if (type === 'tenantName') {
            tooltipPosition.value = {
              bottom: '0.22rem',
              visibility: 'visible',
            };
            tooltipName.value = item.tenantName;
          }

          break;
        case 2:
          if (type === 'differenceRate') {
            tooltipPosition.value = {
              top: '1.95rem',
              visibility: 'visible',
              left: '0.33rem',
            };

            if (energySelect.value === '1') {
              tooltipName.value = item.differenceRate + item.ratioUnit;
            } else {
              tooltipName.value = item.savingRate + item.ratioUnit;
            }
          }

          if (type === 'savingRate') {
            tooltipPosition.value = {
              top: '2.25rem',
              visibility: 'visible',
              left: '0.33rem',
            };
            tooltipName.value = '实际' + item.savingRate + item.ratioUnit;
          }

          if (type === 'targetRate') {
            tooltipPosition.value = {
              top: '2.45rem',
              visibility: 'visible',
              left: '0.33rem',
            };
            tooltipName.value = '目标' + item.targetRate + item.ratioUnit;
          }

          if (type === 'tenantName') {
            tooltipPosition.value = {
              bottom: '0.22rem',
              visibility: 'visible',
              left: '0.33rem',
            };
            tooltipName.value = item.tenantName;
          }

          break;
        case 3:
          if (type === 'differenceRate') {
            tooltipPosition.value = {
              top: '2.06rem',
              visibility: 'visible',
              right: '0.24rem',
            };

            if (energySelect.value === '1') {
              tooltipName.value = item.differenceRate + item.ratioUnit;
            } else {
              tooltipName.value = item.savingRate + item.ratioUnit;
            }
          }

          if (type === 'savingRate') {
            tooltipPosition.value = {
              top: '2.35rem',
              visibility: 'visible',
              right: '0.24rem',
            };
            tooltipName.value = '实际' + item.savingRate + item.ratioUnit;
          }

          if (type === 'targetRate') {
            tooltipPosition.value = {
              top: '2.05rem',
              visibility: 'visible',
              right: '0.24rem',
            };
            tooltipName.value = '目标' + item.targetRate + item.ratioUnit;
          }

          if (type === 'tenantName') {
            tooltipPosition.value = {
              bottom: '0.22rem',
              visibility: 'visible',
              right: '0.24rem',
            };
            tooltipName.value = item.tenantName;
          }

          break;
        default:
          return;
      }
      // console.log(tooltipName.value, isTooltip.value);
    };

    const typeNamePositio = (type: string) => {
      switch (type) {
        case 'differenceRate':
          tooltipPosition.value = {
            top: '1.75rem',
            visibility: 'visible',
          };
          break;
        case 'savingRate':
          tooltipPosition.value = {
            top: '1.75rem',
            visibility: 'visible',
          };
          break;
        case 'targetRate':
          tooltipPosition.value = {
            top: '1.75rem',
            visibility: 'visible',
          };
          break;
        case 'tenantName':
          tooltipPosition.value = {
            top: '1.75rem',
            visibility: 'visible',
          };
          break;
        default:
          return;
      }
    };
    /**
     * 节点数据移出，隐藏tooltip
     * @param orderIndex 节点详情排名
     */
    const tooltipOut = (orderIndex: number) => {
      isTooltip.value = false;
    };
    //#endregion
    return {
      sEnergy,
      energySelect,
      tooltipPosition,
      tooltipName,
      isTooltip,
      energyChange,
      energyBodyUrl,
      infobg,
      energyRateValue,
      tooltipChange,
      tooltipOut,
    };
  },
  computed: {
    energyTypeList: (): Array<{ label: string; value: CH_EnergyQueryType }> =>
      Object.entries(CH_EnergyQueryType)
        .filter(([k, v]) => typeof v === 'string')
        .map(([k, v]) => ({ label: k, value: v as CH_EnergyQueryType })),
    energyData: function (): CH_EnergyOverviewType[] {
      return this.sEnergy.energyDate;
    },
  },
});
