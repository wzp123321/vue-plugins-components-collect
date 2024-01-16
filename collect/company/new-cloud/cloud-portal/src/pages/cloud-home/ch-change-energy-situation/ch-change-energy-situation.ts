import ChChangeEnergySituationService from './service/ch-change-energy-situation';
import { defineComponent, onMounted, ref } from 'vue';
import { TResChangeEnergySituationObj } from './service/ch-change-energy-situation.api';
import { IRes, FResHandler } from '@/core/communication';
import { interval, Subject, takeUntil } from 'rxjs';

export default defineComponent({
  name: 'ChangeEnergySituation',
  setup() {
    const changeDefaultEnergySituationServiceList = [
      {
        projectCode: '1',
        projectCount: '',
        projectName: '',
        savingAmount: '',
      },
      {
        projectCode: '2',
        projectCount: '',
        projectName: '',
        savingAmount: '',
      },
      {
        projectCode: '3',
        projectCount: '',
        projectName: '',
        savingAmount: '',
      },
      {
        projectCode: '4',
        projectCount: '',
        projectName: '',
        savingAmount: '',
      },
    ];
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    const changeEnergySituationServiceList = ref<TResChangeEnergySituationObj[]>(
      changeDefaultEnergySituationServiceList,
    );
    const getQueryOverview = async () => {
      const res: IRes<TResChangeEnergySituationObj[]> = await ChChangeEnergySituationService.queryOverview();
      if (res && res.data && res.data !== null) {
        changeEnergySituationServiceList.value = FResHandler(res);
      } else {
        changeEnergySituationServiceList.value = changeDefaultEnergySituationServiceList;
      }
    };
    const mapImg = (code: string) => {
      let name = '';
      switch (code) {
        case '1':
          name = 'ch-ces-air-conditioner';
          break;
        case '2':
          name = 'ch-ces-boiler';
          break;
        case '3':
          name = 'ch-ces-light';
          break;
        default:
          name = 'ch-ces-other';
          break;
      }
      return new URL(`../../../assets/img/cloud-home/ch-change-energy-situation/${name}.svg`, import.meta.url).href;
    };
    const mapBackground = (code: string, val?: string) => {
      const opacity = val === 'main' ? '0.2' : '0.6';
      if (['1', '2'].includes(code)) {
        return `linear-gradient(to right, rgba(51, 154, 255, 0), rgba(51, 154, 255, ${opacity}), rgba(51, 154, 255, 0))`;
      } else {
        return `linear-gradient(to right, rgba(71, 199, 105, 0), rgba(71, 199, 105, ${opacity}), rgba(71, 199, 105, 0))`;
      }
    };
    onMounted(() => {
      getQueryOverview();
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          getQueryOverview();
        });
    });
    return {
      changeEnergySituationServiceList,
      mapImg,
      mapBackground,
    };
  },
});
