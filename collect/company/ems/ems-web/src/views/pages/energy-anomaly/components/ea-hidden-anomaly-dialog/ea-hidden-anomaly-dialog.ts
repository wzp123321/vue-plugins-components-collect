import { defineComponent, reactive, toRefs, computed } from 'vue';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';
// config
import useCurrentInstance from '@/utils/use-current-instance';

interface EnergyHiddenState {
  dialogVisible: boolean;
  loading: boolean;
  hideFilterText: string;
  cancelHideParams: EnergyAnomalyModule.CancelHideCardParams;
  hideAnomalyList: EnergyAnomalyModule.PersonalHiddenAnomalyInfo[];
}

const INFINITY_DAY = 9999;

export default defineComponent({
  name: 'EnergyHiddenAnomalyDialog',
  props: {
    userName: {
      type: String,
      default: '',
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const energyHiddenState = reactive<EnergyHiddenState>({
      dialogVisible: false,
      hideFilterText: '',
      loading: false,
      cancelHideParams: {
        treeId: 0,
        typeId: 0,
        hideDay: 0,
        userName: '',
      },
      hideAnomalyList: [],
    });
    // 计算属性获取过滤后的列表
    const computedList = computed(() => {
      return energyHiddenState.hideAnomalyList.filter(item => {
        return item.treeName.indexOf(energyHiddenState.hideFilterText) !== -1;
      });
    });
    // 弹框宽度
    const computedDialogWidth = computed(() => {
      let max = 1;
      energyHiddenState.hideAnomalyList.forEach(item => {
        if (item?.hideCardList?.length > max) {
          max = item?.hideCardList?.length;
        }
      });
      return max >= 3 ? '1104px' : max === 2 ? '852px' : '600px';
    });
    // 展开
    const show = () => {
      energyHiddenState.hideFilterText = '';
      energyHiddenState.dialogVisible = true;
      getHiddenAnomalyList();
    };
    // 查询隐藏列表
    const getHiddenAnomalyList = async () => {
      try {
        energyHiddenState.loading = true;
        const res = await energyAnomalyService.getPersonalHiddenAnomalyList();
        if (res && res.code === 200 && res.data) {
          energyHiddenState.loading = false;
          energyHiddenState.hideAnomalyList = res.data;
        } else {
          energyHiddenState.loading = false;
          energyHiddenState.hideAnomalyList = [];
        }
      } catch (error) {
        energyHiddenState.loading = false;
        energyHiddenState.hideAnomalyList = [];
      }
    };
    // 取消隐藏
    const onCancelHide = async (hideId: number) => {
      try {
        const res = await energyAnomalyService.getPersonalHiddenAnomalyListCancel(hideId);
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('取消成功');
          await getHiddenAnomalyList();
          if (energyHiddenState.hideAnomalyList?.length === 0) {
            energyHiddenState.dialogVisible = false;
          }
          emit('refresh');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '取消失败');
          }
        }
      } catch (error) {
        proxy.$message.error('取消失败');
      }
    };
    // 点击手动修改输入框显示
    const onCardInsertShow = (item: EnergyAnomalyModule.HideCardInfo, treeId: number) => {
      item.isInserting = true;
      item.insertDay = item.hideDay;
      if (item.insertDay >= 999) {
        item.insertDay = '';
      }
      energyHiddenState.cancelHideParams.userName = props.userName;
      energyHiddenState.cancelHideParams.typeId = item.typeId;
      energyHiddenState.cancelHideParams.treeId = treeId;
    };
    // 全局事件隐藏输入框
    const onHideInput = (e: MouseEvent) => {
      // 排除输入框
      if (
        e &&
        e.target &&
        (e.target as any).className.includes('el-input__inner') &&
        (e.target as any).placeholder &&
        (e.target as any).placeholder === '请输入时长'
      ) {
        return;
      }
      energyHiddenState.hideAnomalyList = energyHiddenState.hideAnomalyList.map(item => {
        item.hideCardList = item.hideCardList.map(childItem => {
          childItem.isInserting = false;
          return childItem;
        });
        return item;
      });
    };
    // 输入框回车键
    const onInputEnterClick = async (item: EnergyAnomalyModule.HideCardInfo) => {
      const { insertDay, hideDay } = item;
      if (insertDay === hideDay) {
        item.isInserting = false;
        return;
      }
      energyHiddenState.loading = true;
      const day = insertDay ? Number(insertDay) : 99999;
      const { treeId, typeId, userName } = energyHiddenState.cancelHideParams;
      try {
        const res = await energyAnomalyService.getPersonalHiddenAnomalyAddOrUpdate({
          hideDay: day,
          treeId,
          typeId,
          userName,
        });
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('修改成功');
          energyHiddenState.loading = false;
          item.isInserting = false;
          getHiddenAnomalyList();
        } else {
          energyHiddenState.loading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '修改失败');
          }
        }
      } catch (error) {
        energyHiddenState.loading = false;
        proxy.$message.error('修改失败');
      }
    };
    // 关闭前回调
    const onDialogBeforeClose = () => {
      energyHiddenState.dialogVisible = false;
    };
    // 输入框校验
    const onDayInsert = (index: number, childIndex: number) => {
      let value: any = String(energyHiddenState.hideAnomalyList[index].hideCardList[childIndex].insertDay);
      value = value.replace(/[^\d]/g, '');
      if (Number(value) > 999) {
        value = '999';
      }
      if (Number(value) < 0) {
        value = null;
      }
      console.log(value);
      energyHiddenState.hideAnomalyList[index].hideCardList[childIndex].insertDay =
        value !== null && value !== '' ? Number(value) : value;
    };

    return {
      ...toRefs(energyHiddenState),
      computedList,
      INFINITY_DAY,
      computedDialogWidth,
      show,
      onCancelHide,
      onCardInsertShow,
      onHideInput,
      onInputEnterClick,
      onDialogBeforeClose,
      onDayInsert,
    };
  },
});
