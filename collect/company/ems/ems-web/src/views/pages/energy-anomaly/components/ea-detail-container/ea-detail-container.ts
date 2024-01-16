import { defineComponent, ref, computed, PropType, watch } from 'vue';
// 组件
import AnomalyResult from '../ea-result/ea-result.vue';
import EnergyAnomalySetHideDayDialog from '../ea-set-hideday-dialog/ea-set-hideday-dialog.vue';
import BalanceAnomdaly from '../anomalys/ea-dc-balance-anomaly/ea-dc-balance-anomaly.vue';
import ContrastAnomaly from '../anomalys/ea-dc-contrast-anomaly/ea-dc-contrast-anomaly.vue';
import RatioAnomaly from '../anomalys/ea-dc-ratio-dnomaly/ea-dc-ratio-dnomaly.vue';
import KpiAnomaly from '../anomalys/ea-dc-kpi-anomaly/ea-dc-kpi-anomaly.vue';
import RankAnomaly from '../anomalys/ea-dc-rank-anomaly/ea-dc-rank-anomaly.vue';
import PeakAnomaly from '../anomalys/ea-dc-peak-anomaly/ea-dc-peak-anomaly.vue';
import CostAnomaly from '../anomalys/ea-dc-cost-anomaly/ea-dc-cost-anomaly.vue';
import BasisAnomaly from '../anomalys/ea-dc-basis-anomaly/ea-dc-basis-anomaly.vue';
import CorrelationAnomaly from '../anomalys/ea-dc-correlation-anomaly/ea-dc-correlation-anomaly.vue';
import BoundaryAnomaly from '../anomalys/ea-boundary-anomaly/ea-boundary-anomaly.vue';
import RelationParameter from '../anomalys/ea-dc-relation-parameter/ea-dc-relation-parameter.vue';
// enum
import { ANOMALY_RESULT_TYPE, ANOMALY_TYPE } from '@/config/enum';
import { AbnormalType } from '../../constant/index';
// store
import { useStore } from 'vuex';
// utils
import { onPageTo } from '../../utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';

export default defineComponent({
  name: 'AnomalyDetailContainer',
  props: {
    // 数据源
    typeAnomalyDetail: {
      type: Object as PropType<GlobalModule.CommonObject>,
      default: {},
    },
    // 类型
    type: {
      type: String,
      default: '',
    },
    // treeId
    treeId: {
      type: Number,
      default: 0,
    },
    expand: {
      type: Boolean,
      default: false,
    },
    // 树类型
    treeType: {
      type: Number,
      default: 1,
    },
    // 能源类型
    energyCode: {
      type: String,
      default: '',
    },
    // 卡片id
    id: {
      type: Number,
      default: 0,
    },
  },
  components: {
    AnomalyResult,
    EnergyAnomalySetHideDayDialog,
    BalanceAnomdaly,
    ContrastAnomaly,
    RatioAnomaly,
    BasisAnomaly,
    CorrelationAnomaly,
    KpiAnomaly,
    PeakAnomaly,
    CostAnomaly,
    RankAnomaly,
    BoundaryAnomaly,
    RelationParameter,
  },
  emits: ['dealSuccess'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const setHideDay = ref(null);
    const dealLoading = ref(false);
    const type = computed(() => {
      return props.type;
    });
    const typeAnomalyDetail = computed(() => {
      return props.typeAnomalyDetail;
    });
    const treeId = computed(() => {
      return props.treeId;
    });
    const treeType = computed(() => {
      return props.treeType;
    });
    const energyCode = computed(() => {
      return props.energyCode;
    });
    const id = computed(() => {
      return props.id;
    });

    // userName
    const userName = computed(() => {
      return store.getters.username || '';
    });
    // 设置时长入参
    const hideDayParams = ref<EnergyAnomalyModule.CancelHideCardParams>({
      hideDay: 0,
      treeId: 0,
      typeId: 0,
      userName: userName.value,
    });
    // 需要处理的异常alarmId
    const alarmId = ref<number>(0);
    // 异常处理描述
    const processDescription = ref('');
    // 是否展开
    const isExpanded = ref<boolean>(props.expand);
    // 打开设置时长弹框
    const onSetDayDialogShow = () => {
      console.log(321321);
      hideDayParams.value.treeId = props.treeId;
      hideDayParams.value.typeId = props.typeAnomalyDetail.typeId;
      if (setHideDay.value) {
        (setHideDay.value as any).show();
      }
    };
    // 跳转详情页 参数准备
    const lintToDetailPage = () => {
      let params: GlobalModule.CommonObject = {
        treeId: props.treeId,
        treeType: props.treeType,
        energyCode: props.energyCode,
      };
      switch (props.typeAnomalyDetail.typeId) {
        case AbnormalType.CORRELATION:
          // 参数列表
          const browserParamList =
            props.typeAnomalyDetail && props.typeAnomalyDetail.abnormalCorrelationDataList
              ? props.typeAnomalyDetail.abnormalCorrelationDataList.map(
                  (item: EnergyAnomalyModule.AbnormalCorrelationDataList, index: number) => {
                    const { paramName } = item;
                    return {
                      paramName,
                      index,
                    };
                  },
                )
              : [];
          params = {
            ...params,
            browserParamList,
          };
          break;
        case AbnormalType.CONTRAST:
          params = {
            ...params,
            contrastId: props.typeAnomalyDetail.abnormalContrastDataList[0].contrastTreeId,
          };
          break;
        case AbnormalType.RANK:
          params = {
            ...params,
            groupId: props.typeAnomalyDetail.abnormalRankDataList[0].groupId,
          };
          break;
        case AbnormalType.RATIO:
          params = {
            ...params,
            energyCode: [props.energyCode],
            timeUnit: '1h',
            date: [props.typeAnomalyDetail.predictTimestamp, props.typeAnomalyDetail.currentTimestamp],
          };
          break;
        case AbnormalType.BOUNDARY:
          params = {
            ...params,
            energyCode: [props.energyCode],
            timeUnit: '1d',
            date: [props.typeAnomalyDetail.startTime, props.typeAnomalyDetail.endTime],
          };
          break;
      }
      onPageTo(props.typeAnomalyDetail.typeId, params);
    };
    /**
     * 展示输入框
     * 如果类型是 排名变化、能耗对比、关联分析 则取详情中数组的第一个
     */
    const onProcessInputShow = () => {
      let value = 0;
      switch (props.typeAnomalyDetail.typeId) {
        case AbnormalType.RANK:
          value = alarmId.value === 0 ? props.typeAnomalyDetail.abnormalRankDataList[0].alarmId : 0;
          break;
        case AbnormalType.CONTRAST:
          value = alarmId.value === 0 ? props.typeAnomalyDetail.abnormalContrastDataList[0].alarmId : 0;
          break;
        case AbnormalType.CORRELATION:
          value = alarmId.value === 0 ? props.typeAnomalyDetail.abnormalCorrelationDataList[0].alarmId : 0;
          break;
        default:
          value = alarmId.value === 0 ? props.typeAnomalyDetail.alarmId : 0;
      }
      alarmId.value = value;
      processDescription.value = '';
    };
    // 取消输入框
    const onCancel = () => {
      alarmId.value = 0;
      processDescription.value = '';
    };
    // 提交
    const onSubmit = async () => {
      if (dealLoading.value) {
        return;
      }
      dealLoading.value = true;
      try {
        const res = await energyAnomalyService.getAbnormalDeal({
          alarmId: alarmId.value,
          handleRemarks: processDescription.value,
          operateType: '3',
        });
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('异常处理成功');
          alarmId.value = 0;
          emit('dealSuccess');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '异常处理失败');
          }
        }
      } catch (error) {
        proxy.$message.error('异常处理失败');
      } finally {
        dealLoading.value = false;
      }
    };
    // 是否折叠
    const onExpandOrNot = () => {
      isExpanded.value = !isExpanded.value;
    };
    /**
     * 监听展开变化
     */
    watch(
      () => props.expand,
      () => {
        if (props.typeAnomalyDetail.solutionList.length === 0 && props.typeAnomalyDetail.causeSet.length === 0) {
          isExpanded.value = false;
        } else {
          isExpanded.value = props.expand;
        }
      },
    );
    /**
     * 监听告警id变化
     */
    watch(
      () => alarmId.value,
      () => {
        processDescription.value = '';
      },
    );
    return {
      ANOMALY_RESULT_TYPE,
      ANOMALY_TYPE,
      typeAnomalyDetail,
      isExpanded,
      type,
      setHideDay,
      hideDayParams,
      energyCode,
      treeId,
      treeType,
      alarmId,
      processDescription,
      AbnormalType,
      dealLoading,
      id,

      onSetDayDialogShow,
      lintToDetailPage,
      onProcessInputShow,
      onCancel,
      onSubmit,
      onExpandOrNot,
    };
  },
});
