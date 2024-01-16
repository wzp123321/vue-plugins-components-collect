import { defineComponent, reactive, toRefs, PropType, inject, computed } from 'vue';
import { useStore } from 'vuex';
// config
import { anomalyHideDays } from '@/config/config';
import useCurrentInstance from '@/utils/use-current-instance';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';

interface SetHideDayState {
  dialogVisible: boolean;
  selectedDay: number;
  loading: boolean;
  insertDay: number | null;
}
export default defineComponent({
  name: 'EnergyAnomalySetHideDayDialog',
  props: {
    // 参数
    hideDayParams: {
      type: Object as PropType<EnergyAnomalyModule.CancelHideCardParams>,
      default: {},
    },
  },
  inject: ['onSubmitSuccess'],
  setup(props) {
    const store = useStore();
    //   接收爷爷组件传递过来的方法
    const onSubmitSuccess: any = inject('onSubmitSuccess');
    const { proxy } = useCurrentInstance();
    // 用户名
    const userName = computed(() => {
      return store.getters.username;
    });
    const setHideDayState = reactive<SetHideDayState>({
      dialogVisible: false,
      selectedDay: anomalyHideDays[0].value,
      loading: false,
      insertDay: null,
    });
    // 打开弹框
    const show = () => {
      setHideDayState.insertDay = null;
      setHideDayState.dialogVisible = true;
    };
    // 输入框校验
    const onDayInsert = () => {
      if (!setHideDayState.insertDay) {
        return '';
      }
      setHideDayState.insertDay = Number(String(setHideDayState.insertDay).replace(/[^\d]/g, ''));
      if (Number(setHideDayState.insertDay) > 999) {
        setHideDayState.insertDay = 999;
      }
      if (Number(setHideDayState.insertDay) <= 0) {
        setHideDayState.insertDay = null;
      }
    };
    // 提交
    const onHideDaySubmit = async () => {
      setHideDayState.dialogVisible = false;
      const { treeId, typeId } = props.hideDayParams;
      const hideDay = !setHideDayState.insertDay ? setHideDayState.selectedDay : setHideDayState.insertDay;
      try {
        setHideDayState.loading = true;
        const res = await energyAnomalyService.getPersonalHiddenAnomalyAddOrUpdate({
          treeId,
          typeId,
          userName: userName.value,
          hideDay,
        });
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('设置隐藏时长成功');
          onSubmitSuccess();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '设置隐藏时长失败');
          }
        }
      } catch (error) {
        proxy.$message.error('设置隐藏时长失败');
      } finally {
        setHideDayState.dialogVisible = false;
        setHideDayState.loading = false;
      }
    };

    return {
      ...toRefs(setHideDayState),
      anomalyHideDays,
      onDayInsert,
      show,
      onHideDaySubmit,
    };
  },
});
