import { defineComponent, reactive, toRefs, PropType, computed, provide, watch, ref } from 'vue';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';
import { EA_IAnomalyDetail, EA_IBoundaryAnomalyInfo, EAnomalyTypes } from '../../energy-anomaly.api';
import { EA_ST_TABS } from '../ea-switch-tab/ea-switch-tab.api';
// config
import { ANOMALY_TYPE } from '@/config/enum';
// component
import AnomalyDetailContainer from '../ea-detail-container/ea-detail-container.vue';

interface EnergyAnomalyDetailState {
  dialogVisible: boolean;
  loading: boolean;
  isError: boolean;
  hasHidden: boolean;
  anomalyDetail: EA_IAnomalyDetail;
}

export default defineComponent({
  name: 'EnergyAnomalyDetailDialog',
  props: {
    queryAnomalyDetailParams: {
      type: Object as PropType<EnergyAnomalyModule.QueryAnomalyDetailtParams>,
      default: {},
    },
    currentTab: {
      type: String,
      default: '1',
    },
  },
  emits: ['refresh', 'refreshCount'],
  components: {
    AnomalyDetailContainer,
  },

  setup(props, { emit }) {
    const currentTab = computed(() => {
      return props.currentTab;
    });
    const energyAnomalyDetailState = reactive<EnergyAnomalyDetailState>({
      dialogVisible: false,
      loading: true,
      isError: false,
      hasHidden: false,
      anomalyDetail: {
        treeId: 0,
        treePath: '',
        treeName: '',
        abnormalNumber: 0,
      },
    });
    // 获取默认打开的·异常类型·
    const defaultExpandType = ref('');
    // 请求参数
    const params = computed(() => {
      return props.queryAnomalyDetailParams;
    });
    // 打开弹框
    const show = async () => {
      energyAnomalyDetailState.isError = false;
      energyAnomalyDetailState.anomalyDetail = {
        abnormalNumber: 0,
        treeId: 0,
        treePath: '',
        treeName: '',
      };
      energyAnomalyDetailState.dialogVisible = true;
      await getAnomalyDetail();
    };
    // 请求详情
    const getAnomalyDetail = async () => {
      try {
        energyAnomalyDetailState.loading = true;
        const { energyCode, treeType, typeIds, userName, treeId, abnormalTime, id } = props.queryAnomalyDetailParams;
        const res =
          props.currentTab === EA_ST_TABS.边界异常
            ? await energyAnomalyService.getBoundaryAnomalyDetail({
                id,
                energyCode,
                treeType,
                typeIds,
                userName,
                treeId,
                abnormalTime,
              })
            : await energyAnomalyService.getPersonalAnomalyDetail({
                energyCode,
                treeType,
                typeIds,
                userName,
                treeId,
                abnormalTime,
              });
        if (res && res.success && res.data) {
          if (props.currentTab === EA_ST_TABS.边界异常) {
            energyAnomalyDetailState.anomalyDetail.treeName = res?.data?.treeName;
            energyAnomalyDetailState.anomalyDetail.treePath = res?.data?.treePath;
            energyAnomalyDetailState.anomalyDetail.boundary = {
              ...(res?.data as EA_IBoundaryAnomalyInfo),
              typeId: EAnomalyTypes.边界异常,
            };
          } else {
            energyAnomalyDetailState.anomalyDetail = res.data as EA_IAnomalyDetail;
          }
          energyAnomalyDetailState.isError = false;
        } else {
          energyAnomalyDetailState.isError = true;
        }
      } catch (error) {
        energyAnomalyDetailState.isError = true;
      } finally {
        energyAnomalyDetailState.loading = false;
      }
    };
    // 关闭前
    const onDetailDialogBeforeClose = () => {
      energyAnomalyDetailState.dialogVisible = false;
    };
    // 异常处理回调
    const onDealAbnormalSuccess = async () => {
      await getAnomalyDetail();
      // 只有一个异常
      if (energyAnomalyDetailState.anomalyDetail && energyAnomalyDetailState.anomalyDetail.abnormalNumber === 0) {
        energyAnomalyDetailState.dialogVisible = false;
      }
      emit('refresh');
    };

    watch(
      () => energyAnomalyDetailState.anomalyDetail,
      newVal => {
        if (newVal && newVal.balance) {
          defaultExpandType.value = ANOMALY_TYPE.BALANCE;
        } else if (newVal && newVal.basis) {
          defaultExpandType.value = ANOMALY_TYPE.BASIS;
        } else if (newVal && newVal.contrast) {
          defaultExpandType.value = ANOMALY_TYPE.CONTRAST;
        } else if (newVal && newVal.correlation) {
          defaultExpandType.value = ANOMALY_TYPE.CORRELATION;
        } else if (newVal && newVal.cost) {
          defaultExpandType.value = ANOMALY_TYPE.COST;
        } else if (newVal && newVal.kpi) {
          defaultExpandType.value = ANOMALY_TYPE.KPI;
        } else if (newVal && newVal.peak) {
          defaultExpandType.value = ANOMALY_TYPE.PEAK;
        } else if (newVal && newVal.rank) {
          defaultExpandType.value = ANOMALY_TYPE.RANK;
        } else if (newVal && newVal.energy) {
          defaultExpandType.value = ANOMALY_TYPE.RATIO;
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    /**
     * 返回右上角tag
     * @returns
     */
    const mapAnomalyTag = () => {
      return energyAnomalyDetailState.anomalyDetail && energyAnomalyDetailState.anomalyDetail.energy
        ? '用能异常'
        : energyAnomalyDetailState.anomalyDetail && energyAnomalyDetailState.anomalyDetail.boundary
        ? '边界异常'
        : `${energyAnomalyDetailState.anomalyDetail.abnormalNumber || 0}项异常`;
    };

    // provide
    provide('onSubmitSuccess', async () => {
      energyAnomalyDetailState.hasHidden = true;
      // await getAnomalyDetail();
      // if (energyAnomalyDetailState.anomalyDetail.abnormalNumber === 0) {
      //   energyAnomalyDetailState.dialogVisible = false;
      // }
      emit('refreshCount');
    });
    provide('handleClose', () => {
      onDetailDialogBeforeClose();
    });
    provide('handleRefresh', () => {
      energyAnomalyDetailState.dialogVisible = false;
      emit('refresh');
    });

    return {
      ...toRefs(energyAnomalyDetailState),
      ANOMALY_TYPE,
      defaultExpandType,
      params,
      currentTab,

      mapAnomalyTag,
      show,
      onDetailDialogBeforeClose,
      onDealAbnormalSuccess,
    };
  },
});
