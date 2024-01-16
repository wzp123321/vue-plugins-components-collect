/*
 * @Author: yut
 * @Date: 2023-11-27 15:37:42
 * @LastEditors: yut
 * @LastEditTime: 2023-11-28 10:37:39
 * @Descripttion:
 */
import { defineComponent, ref, onMounted } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import ProjectIntroduction from '@/views/pages/home/components/home-project-introduction/home-project-introduction.vue';
import CostCompareOverview from '@/views/pages/home/components/home-cost-compare-overview/home-cost-compare-overview.vue';
import Kpi from '@/views/pages/home/components/home-kpi/home-kpi.vue';
import EnergyConsumptionRank from '@/views/pages/home/components/home-energy-consumption-rank/home-energy-consumption-rank.vue';
import KeyAreaAnalysis from '@/views/pages/home/components/home-key-area-analysis/home-key-area-analysis.vue';
import EnergyItemRatio from '@/views/pages/home/components/home-energyitem-ratio/home-energyitem-ratio.vue';
import AssociationAnalysis from '@/views/pages/home/components/home-association-analysis/home-association-analysis.vue';
import UnitAreaEnergyRank from '@/views/pages/home/components/home-unit-area-energy-rank/home-unit-area-energy-rank.vue';
import EnergyCostAnalysis from '@/views/pages/home/components/home-energy-cost-analysis/home-energy-cost-analysis.vue';
import AlarmEventAnalysis from '@/views/pages/home/components/home-alarm-event-analysis/home-alarm-event-analysis.vue';
import SlideEnergyConsumption from '@/views/pages/home/components/home-slide-energy-consumption/index.vue';
import DeviceStatusMonitor from '@/views/pages/home/components/home-device-status-monitor/index.vue';
import ProjectSiteOverview from '@/views/pages/home/components/home-project-site-overview/index.vue';

import EnergySubItem from '@/views/pages/home/components/home-energy-sub-item/home-energy-sub-item.vue';
// services
import HomeService from '@/views/pages/home/util/index'; // 组件对应code全都存放在该文件中
import HomeServiceService from '@/views/pages/home/services/home';

export default defineComponent({
  name: 'Home',
  components: {
    ProjectIntroduction,
    CostCompareOverview,
    Kpi,
    EnergyConsumptionRank,
    KeyAreaAnalysis,
    EnergyItemRatio,
    AssociationAnalysis,
    UnitAreaEnergyRank,
    AlarmEventAnalysis,
    EnergyCostAnalysis,
    SlideEnergyConsumption,
    DeviceStatusMonitor,
    ProjectSiteOverview,
    EnergySubItem,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const componentPage = ref<HomeModule.ComponentPage[]>([]); // 接口布局数据
    const containerOptions = ref<HomeModule.ComponentItem[][] | []>([]); // 布局数据二维数组
    // 是否展示缺省图
    const showNotData = ref(false);
    const componentMap = ref({}); // 映射对象
    const isSwitch = ref<any[]>([]); // 导航按钮数组，用于控制导出按钮显示隐藏
    onMounted(() => {
      getComponentPageData();
    });
    /**
     * 获取布局数据
     */
    const configContentData = ref<any>();
    const getComponentPageData = async () => {
      showNotData.value = false;
      await HomeServiceService.getComponentPage()
        .then((res: HttpRequestModule.ResTemplate<HomeModule.ComponentPage[]>) => {
          if (res && res.code === 200) {
            //console.log('====', res.data);
            componentPage.value = res.data || [];
            componentMap.value = HomeService.componentMap();
            containerOptions.value = HomeService.getContainerOptions(componentPage.value);
            if (containerOptions.value?.length === 0) {
              showNotData.value = true;
            }
          } else {
            showNotData.value = true;
          }
        })
        .catch((error: Error) => {
          proxy.$message.error(error && error.message ? error.message : '查询失败，网络不佳！');
          showNotData.value = true;
        });
    };
    const getSwitchItemsOk = (val: any, id: number) => {
      isSwitch.value.push({ isShow: val, id });
    };
    // 组件的tree
    const treeIds = ref<any>([]);
    const getTreeListId = (item: any) => {
      treeIds.value.push(item);

      //  console.log(treeIds.value);
    };
    return {
      componentPage,
      componentMap,
      containerOptions,
      showNotData,
      isSwitch,
      treeIds,
      getSwitchItemsOk,
      getTreeListId,
    };
  },
});
