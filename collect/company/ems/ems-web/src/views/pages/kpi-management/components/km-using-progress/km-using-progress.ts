import { defineComponent, computed, PropType, ref, onMounted } from 'vue';

import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'UsingProgress',
  props: {
    /**
     * 标题
     */
    title: {
      type: String,
      default: '使用进度',
    },
    /**
     * 时间范围即当前查询的区间
     */
    dateScope: {
      type: Object,
    },
    /**
     * 当前日期 当天(按月查询)或者当月天(按年查询)
     */
    currentDate: {
      type: String,
      default: '',
    },
    /**
     * 消耗值
     */
    consume: {
      type: Object as PropType<EnergyConservationAssess.UsageProgressItem>,
    },
    /**
     * 理想值
     */
    ideal: {
      type: Object as PropType<EnergyConservationAssess.UsageProgressItem>,
    },
    /**
     * 定额值
     */
    quota: {
      type: Object as PropType<EnergyConservationAssess.UsageProgressItem>,
    },
    /**
     * 单位
     */
    unit: {
      type: String,
      default: 'kWh',
    },
    /**
     * 定额标题
     */
    quotaTitle: {
      type: String,
      default: '定额值',
    },
    /**
     * 是否为历史数据
     */
    isHistoryDate: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const {
      title,
      dateScope,
      currentDate,
      quotaTitle,
      unit,
      isHistoryDate,
    } = props;
    console.log(dateScope);
    // 字体颜色数组
    const colors = [
      'var(--progress-green-color)',
      'var(--progress-blue-color)',
      'var(--progress-yellow-color)',
      'var(--progress-red-color)',
    ];
    const backgroundColors = [
      'var(--energy-tooltip-blue-bg-color)',
      'var(--energy-tooltip-yellow-bg-color)',
      'var(--energy-tooltip-red-bg-color)',
    ];
    // 图标数组
    const circles = [
      require('../../../../../assets/img/energy-conservation-assess/ec-lf-bar-circle.svg'),
      require('../../../../../assets/img/energy-conservation-assess/ec-bar-circle-over-ideal.svg'),
      require('../../../../../assets/img/energy-conservation-assess/ec-lf-bar-circle-overflow.svg'),
    ];
    //  当前消耗值对象
    const compCosume: any = computed(() => {
      return props.consume;
    });
    // 当前理想值对象
    const compIdeal = computed(() => {
      return props.ideal;
    });
    // 当前定额值对象
    const compQuota = computed(() => {
      return props.quota;
    });
    /**
     * 当前状态
     * 0-  当前值<理想值 < 定额
     * 1-  当前值>理想值 < 定额
     * 2-  当前值>定额
     */
    const status = computed(() => {
      let status = 0;
      const cosumeValue =
        compCosume.value && compCosume.value.itemValue
          ? compCosume.value.itemValue
          : 0;
      const idealValue =
        compIdeal.value && compIdeal.value.itemValue
          ? compIdeal.value.itemValue
          : 0;
      const quotaValue =
        compQuota.value && compQuota.value.itemValue
          ? compQuota.value.itemValue
          : 0;
      if (
        idealValue !== 0 &&
        cosumeValue > idealValue &&
        idealValue < quotaValue
      ) {
        status = 1;
      }
      if (cosumeValue > quotaValue) {
        status = 2;
      }

      return status;
    });

    const width = ref<number>(0); // 动态获取定额值理想值框的宽度
    onMounted(() => {
      console.log(document.querySelector('.km-using-progress__bar-ideal'));
      if (document.querySelector('.km-using-progress__bar-ideal')) {
        width.value =
          (document.querySelector(
            '.km-using-progress__bar-ideal',
          ) as HTMLElement).offsetWidth / 2;
      }
    });

    return {
      title,
      dateScope,
      currentDate,
      unit,
      compCosume,
      compIdeal,
      compQuota,
      quotaTitle,
      status,
      colors,
      backgroundColors,
      circles,
      isHistoryDate,
      width,

      thousandSeparation,
    };
  },
});
