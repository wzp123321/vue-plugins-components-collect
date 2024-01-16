import { defineComponent, PropType, computed } from 'vue';

import { EA_ST_TABS } from '../ea-switch-tab/ea-switch-tab.api';

export default defineComponent({
  name: 'EnergyAnomalyCard',
  props: {
    energyAnomalyInfo: {
      type: Object as PropType<GlobalModule.CommonObject>,
    },
    isMenuCollapsed: {
      type: Boolean,
      default: false,
    },
    currentTab: {
      type: String,
      default: '1',
    },
  },
  setup(props) {
    const isMenuCollapsed = computed(() => {
      return props.isMenuCollapsed;
    });
    const energyAnomalyInfo = computed(() => {
      return props.energyAnomalyInfo;
    });
    const currentTab = computed(() => {
      return props.currentTab;
    });

    return {
      energyAnomalyInfo,
      isMenuCollapsed,
      currentTab,
      EA_ST_TABS,
    };
  },
});
