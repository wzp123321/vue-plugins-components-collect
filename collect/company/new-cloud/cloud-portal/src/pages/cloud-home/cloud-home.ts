import dayjs from 'dayjs';
import { interval, Subject, takeUntil, timer } from 'rxjs';
import { defineComponent, Component, defineAsyncComponent, reactive, ref, onUnmounted, onMounted } from 'vue';
import { CH_EProfitState, CH_EWeather, CH_EWeek } from './cloud-home.api';

import './service/token';
import InfoService from './service/ch-info.service';
import sProject from './service/ch-project.service';

import ChMap from './ch-map/ch-map.vue';
import ChProjectInfo from './ch-project-info/ch-project-info.vue';
import ChSaveEnergy from './ch-save-energy/ch-save-energy.vue';
import ChCarbonIntensity from './ch-carbon-intensity/ch-carbon-intensity.vue';
import ChEnergyOverview from './ch-energy-overview/ch-energy-overview.vue';
import ChProfitRanking from './ch-profit-ranking/ch-profit-ranking.vue';
import ChChangeEnergySituation from './ch-change-energy-situation/ch-change-energy-situation.vue';

// 动态组件模块路径配置
const PATH = {
  'ch-module-center': './ch-map/ch-map.vue',
  'ch-module-lt': './ch-project-info/ch-project-info.vue',
  'ch-module-lm': './ch-save-energy/ch-save-energy.vue',
  'ch-module-lb': './ch-carbon-intensity/ch-carbon-intensity.vue',
  'ch-module-rt': './ch-energy-overview/ch-energy-overview.vue',
  'ch-module-rm': './ch-profit-ranking/ch-profit-ranking.vue',
  'ch-module-rb': './ch-change-energy-situation/ch-change-energy-situation.vue',
};
Object.freeze(PATH);

export default defineComponent({
  name: 'CloudHomeComponent',
  components: {
    ChMap,
    ChProjectInfo,
    ChSaveEnergy,
    ChCarbonIntensity,
    ChEnergyOverview,
    ChProfitRanking,
    ChChangeEnergySituation,
  },
  setup() {
    const sInfo = reactive(InfoService);
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    onMounted(() => {
      sInfo.query();
      sProject.queryProjectInfo();
      sProject.queryProjectStatistic();

      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          sInfo.query();
          sProject.queryProjectInfo();
          sProject.queryProjectStatistic();
        });
    });

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    const elLoopVideo = ref<HTMLVideoElement>();

    const showContainer = ref<boolean>(false);
    const showMap = ref<boolean>(false);

    function startAnimation(event: Event): void {
      timer(2000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => (showContainer.value = true));
      timer(4000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          showMap.value = true;
          (event.target as HTMLVideoElement)?.remove();
          elLoopVideo.value?.classList.remove('ghost');
          elLoopVideo.value?.play();
        });
    }
    const curTime = ref(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss').slice(0, -3));
    const week = CH_EWeek[new Date().getDay()];
    interval(1000)
      .pipe(takeUntil(_destroy$))
      .subscribe(() => {
        curTime.value = `${dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss').slice(0, -3)}`;
      });

    return { sInfo, elLoopVideo, showContainer, showMap, startAnimation, curTime, week };
  },
  computed: {
    weather: function (): string | undefined {
      let name = '';
      switch (this.sInfo.weather) {
        case CH_EWeather.未知:
          name = 'default';
          break;
        case CH_EWeather.多云:
          name = 'cloudy';
          break;
        case CH_EWeather.雾:
          name = 'foggy';
          break;
        case CH_EWeather.冰雹:
          name = 'hail';
          break;
        case CH_EWeather.小雨:
          name = 'rain-light';
          break;
        case CH_EWeather.中雨:
          name = 'rain-moderate';
          break;
        case CH_EWeather.阴:
          name = 'overcast';
          break;
        case CH_EWeather.雨夹雪:
          name = 'sleet';
          break;
        case CH_EWeather.雪:
          name = 'snow';
          break;
        case CH_EWeather.晴:
          name = 'sunny';
          break;
        case CH_EWeather.雷阵雨:
          name = 'thundershower';
          break;
        default:
          return;
      }
      return new URL(`../../assets/img/common/common-weather/cw-${name}.png`, import.meta.url).href;
    },
    time: function (): string {
      let date = dayjs(this.sInfo.time).format('YYYY-MM-DD HH:mm');
      const week = CH_EWeek[this.sInfo.time.getDay()];
      return `${this.curTime} ${week}`;
    },
    legends: (): Array<{ label: string; value: CH_EProfitState }> =>
      Object.entries(CH_EProfitState)
        .filter(([k, v]) => typeof v === 'number')
        .map(([k, v]) => ({ label: k, value: v as CH_EProfitState })),
  },
  methods: {
    jumpToEnergyEvent: () =>
      window.open(`${import.meta.env.VITE_TENANT_PROXY_URL}energyEventLibrary?time=${+new Date()}`, '_blank'),
    mapProfitRank: (state: CH_EProfitState): string | undefined => {
      switch (state) {
        case CH_EProfitState.亏损:
          return 'deficit';
        case CH_EProfitState.低盈利:
          return 'low';
        case CH_EProfitState.中盈利:
          return 'middle';
        case CH_EProfitState.高盈利:
          return 'high';
        default:
          break;
      }
    },
  },
});

/**
 * 动态加载异步组件模块
 * @returns 异步组件
 */
function loadModule(): Partial<{ [key in keyof typeof PATH]: () => Promise<Component> }> {
  const modules = import.meta.glob('./**/*.vue');
  const components: Partial<{ [key in keyof typeof PATH]: () => Promise<Component> }> = {};

  Object.entries(PATH).forEach(([k, v]) => {
    if (v && Object.keys(modules).includes(v)) {
      components[k] = defineAsyncComponent(modules[v]);
    }
  });

  return components;
}
