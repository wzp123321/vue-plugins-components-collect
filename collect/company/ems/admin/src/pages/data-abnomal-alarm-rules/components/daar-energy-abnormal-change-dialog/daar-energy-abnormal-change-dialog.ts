import { onMounted, defineComponent, watch, nextTick, reactive, toRefs, ref } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import abnomalAlarmRulesService from '@/pages/data-abnomal-alarm-rules/service/data-abnomal-alarm-rules.service';
import { ABNORMAL_TYPES } from '../../constant/index';
import { ElForm } from 'element-plus';

interface engAbnormalState {
  visible: boolean;
  engAbnormalType: number;
  abnormalTypeName: string;
  thresholdName: string;
  generalThreshold: any;
  seriousThreshold: any;
  alarmLevelCode: string;
  alarmLevelName: string;
  alarmLevelList: any;
}
export default defineComponent({
  name: 'energyAbnormalDialog',
  props: {
    rows: {
      type: Object,
      default: () => {},
    },
  },
  components: {},
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const ruleFormRef = ref(ElForm);
    const engAbnormalState = reactive<engAbnormalState>({
      abnormalTypeName: '',
      visible: false,
      engAbnormalType: 0,
      thresholdName: '',
      generalThreshold: null,
      seriousThreshold: null,
      alarmLevelCode: '',
      alarmLevelName: '',
      alarmLevelList: [],
    });
    const rules = reactive({
      generalThreshold: [{ required: true, message: '请输入普通异常阈值', trigger: 'blur' }],
      seriousThreshold: [{ required: true, message: '请输入严重异常阈值', trigger: 'blur' }],
    });
    watch(
      () => props.rows,
      (newVal, oldVal) => {
        nextTick(() => {
          initRowData();
        });
      },
      {
        immediate: true,
      },
    );
    onMounted(async () => {
      getAlarmLevelList();
    });
    //获取告警等级下拉数据
    const getAlarmLevelList = async () => {
      try {
        const params = 'alarm_level';
        const res = await abnomalAlarmRulesService.getDictData(params);
        if (res.code == 200 && res.success) {
          engAbnormalState.alarmLevelList = res.data;
        } else {
          engAbnormalState.alarmLevelList = [];
        }
      } catch (error: any) {
        engAbnormalState.alarmLevelList = [];
      }
    };
    //弹框初始内容
    const initRowData = async () => {
      if (props.rows && JSON.stringify(props.rows) !== '{}') {
        // id,告警等级--alarmLevelText,普调异常阈值--general:,严重异常阈值--serious,
        engAbnormalState.abnormalTypeName = props.rows.abnormalTypeName;
        engAbnormalState.engAbnormalType = props.rows.abnormalType;
        engAbnormalState.thresholdName = props.rows.thresholdName == '--' ? '' : props.rows.thresholdName;
        engAbnormalState.generalThreshold = props.rows.generalData;
        engAbnormalState.seriousThreshold = props.rows.seriousData;
        engAbnormalState.alarmLevelCode = props.rows.alarmLevel;
        engAbnormalState.alarmLevelName = props.rows.alarmLevelText;
      }
    };
    /**
     * 打开弹框重置数据
     */
    const show = () => {
      engAbnormalState.visible = true;
      initRowData();
    };
    //select选择改变
    const handleChange = (val: any) => {
      const newData = engAbnormalState.alarmLevelList.find((item: any) => {
        return item.code === val;
      });
      engAbnormalState.alarmLevelName = newData.name;
    };
    // 取消
    const onCancel = () => {
      ruleFormRef.value.resetFields();
      engAbnormalState.visible = false;
    };
    /**
     * 提交
     */
    const submitForm = async () => {
      const general = engAbnormalState.generalThreshold;
      const serious = engAbnormalState.seriousThreshold;
      // 判断严重是否大于普通
      if (general !== '' && serious !== '' && Number(general) >= Number(serious)) {
        proxy.$message.error('普通阈值不得大于或等于严重阈值！');
        return;
      }
      // 是节能考核
      if (
        engAbnormalState.engAbnormalType === ABNORMAL_TYPES.KPI &&
        ((general !== '' && Number(general) < 100) || (serious !== '' && Number(serious) < 100))
      ) {
        proxy.$message.error('节能考核异常阈值不得小于100%');
        return;
      }
      try {
        const updateParams = {
          id: props.rows.id,
          general: general === '' ? null : Number(general) / 100,
          serious: serious === '' ? null : Number(serious) / 100,
          alarmLevelName: engAbnormalState.alarmLevelName,
          alarmLevel: engAbnormalState.alarmLevelCode,
        };
        const res = await abnomalAlarmRulesService.updatedEngAbnormalData(updateParams);
        if (res.code == 200 && res.success) {
          proxy.$message.success('修改成功');
          emit('engAbnormalRefresh');
          engAbnormalState.visible = false;
        } else {
          engAbnormalState.visible = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error('修改失败');
          }
        }
      } catch (error: any) {
        engAbnormalState.visible = false;
        return proxy.$message.error('修改失败');
      }
    };
    const toSubmit = () => {
      ruleFormRef.value.validate((valid: boolean) => {
        if (valid) {
          submitForm();
        } else {
          return false;
        }
      });
    };

    return {
      ruleFormRef,
      engAbnormalState,
      abnomalAlarmRulesService,
      ABNORMAL_TYPES,
      rules,
      handleChange,
      show,
      toSubmit,
      onCancel,
    };
  },
});
