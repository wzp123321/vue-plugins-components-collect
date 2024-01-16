import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { openBlankUrl } from '@/utils/index';
export default defineComponent({
  name: 'NoDatas',
  props: {
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: '暂无数据',
    },
    imgUrl: {
      type: String,
      default: require('../../../../../../../assets/img/common/common-no-data.svg'),
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    isNoData: {
      type: Boolean,
      default: false,
    },
    kpiType: {
      type: Number || String,
      default: '1',
    },
    kpiTypeId: { type: Number || String, default: 1 },
    kpiDingeType: { type: Number || String, default: 1 },
    energyConservationEnergyCode: { type: String },
  },
  setup(props) {
    const router = useRouter();
    const isNoData = computed(() => {
      return props.isNoData;
    });
    const kpiType = computed(() => {
      return props.kpiType;
    });
    const kpiTypeId = computed(() => {
      return props.kpiTypeId;
    });
    const kpiDingeType = computed(() => {
      return props.kpiDingeType;
    });

    const energyConservationEnergyCode = computed(() => {
      return props.energyConservationEnergyCode;
    });
    const { title, imgUrl } = props;
    const goConfigure = () => {
      if (Number(kpiType.value) === 1) {
        const path = '/web/energyConservationManage';
        if (energyConservationEnergyCode.value) {
          sessionStorage.setItem('ems-energyConservationEnergyCode', energyConservationEnergyCode.value);
          sessionStorage.setItem('ems-kpiDingeType', String(kpiDingeType.value));
          sessionStorage.setItem('ems-energyName', 'home');
        }

        openBlankUrl(path);
      } else {
        if (kpiTypeId.value || kpiTypeId.value === 0) {
          const path = '/web/kpiQuotaConfigurations';
          sessionStorage.setItem('ems-kpiTypeId', String(kpiTypeId.value));
          sessionStorage.setItem('ems-kpiDingeType', String(kpiDingeType.value));
          openBlankUrl(path);
          sessionStorage.setItem('ems-kpiName', 'home');
        }
      }
    };
    return { title, imgUrl, goConfigure, isNoData };
  },
});
